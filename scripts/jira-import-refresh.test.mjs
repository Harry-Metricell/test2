import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requestImport, serviceImportRefresh, validateCompletedRun, validateConfig, isFresh } from './jira-import-refresh.mjs';

const NOW = Date.parse('2026-10-05T10:00:00Z');
const config = { repository:'Harry-Metricell/test2', branch:'main', workflow:'import-ready-for-testing.yml', freshnessMinutes:5, timeoutMinutes:15 };
function fixture(t) {
  const repo=fs.mkdtempSync(path.join(os.tmpdir(),'test2-import-refresh-'));
  t.after(()=>fs.rmSync(repo,{recursive:true,force:true}));
  fs.mkdirSync(path.join(repo,'config'));
  fs.writeFileSync(path.join(repo,'config/jira-import-refresh.json'),JSON.stringify(config));
  const stagingRoot=path.join(repo,'.agent-staging');
  const file=path.join(stagingRoot,'jira-import-refresh.json');
  return {repo,stagingRoot,file};
}
const response = (value={},status=200)=>({ok:status>=200&&status<300,status,json:async()=>value});
const success = request=>({id:123,head_branch:'main',path:'.github/workflows/import-ready-for-testing.yml',event:'workflow_dispatch',display_title:`Coordinator import ${request.requestId}`,created_at:new Date(NOW).toISOString(),updated_at:new Date(NOW+60000).toISOString(),status:'completed',conclusion:'success',html_url:'https://github.com/Harry-Metricell/test2/actions/runs/123'});
const options = f=>({...f,now:NOW,tokenProvider:()=> 'test-secret-never-printed'});

test('no refresh request means no API calls, credentials or subprocesses',async t=>{
  const f=fixture(t);
  const result=await serviceImportRefresh({...options(f),tokenProvider:()=>assert.fail('credentials requested'),fetchImpl:()=>assert.fail('network requested')});
  assert.equal(result.status,'idle');
});
test('pending refresh is idempotent even when another coordinator requests force',t=>{
  const f=fixture(t); const a=requestImport(f.repo,{now:NOW});
  const b=requestImport(f.repo,{now:NOW+1000,force:true});
  assert.equal(a.requestId,b.requestId);
});
test('fresh proof is reusable; expired proof and forced startup request refresh again',t=>{
  const f=fixture(t); const a=requestImport(f.repo,{now:NOW});
  fs.writeFileSync(f.file,JSON.stringify({...a,status:'ready',runId:123,completedAt:new Date(NOW).toISOString()}));
  assert.equal(requestImport(f.repo,{now:NOW+1000}).requestId,a.requestId);
  assert.notEqual(requestImport(f.repo,{now:NOW+360000}).requestId,a.requestId);
  const b=JSON.parse(fs.readFileSync(f.file));
  fs.writeFileSync(f.file,JSON.stringify({...b,status:'ready',runId:124,completedAt:new Date(NOW+360000).toISOString()}));
  assert.notEqual(requestImport(f.repo,{now:NOW+361000,force:true}).requestId,b.requestId);
});
test('successful import proof rejects failure, old runs, wrong workflow and wrong branch',()=>{
  const request={requestId:'test',requestedAt:new Date(NOW).toISOString()}; const run=success(request);
  assert.equal(validateCompletedRun(run,request,config).runId,123);
  for(const change of [{conclusion:'failure'},{status:'queued'},{head_branch:'other'},{event:'schedule'},{display_title:'Unrelated import'},{path:'.github/workflows/status-bundler.yml'},{created_at:new Date(NOW-60000).toISOString()},{updated_at:'invalid'}]) {
    assert.throws(()=>validateCompletedRun({...run,...change},request,config));
  }
});
test('freshness needs verified ready proof and rejects future or stale timestamps',()=>{
  const ready={status:'ready',runId:123,completedAt:new Date(NOW).toISOString()};
  assert.equal(isFresh(ready,config,NOW),true);
  for(const value of [{...ready,status:'waiting'},{...ready,runId:undefined},{...ready,completedAt:new Date(NOW+60000).toISOString()}]) assert.equal(isFresh(value,config,NOW),false);
  assert.equal(isFresh(ready,config,NOW+300001),false);
});
test('dispatch acknowledgement is not completion; next tick observes exact successful run',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW}); let posts=0;
  const fetchImpl=async(url,opts)=>{
    assert.equal(opts.headers.Authorization,'Bearer test-secret-never-printed');
    if(opts.method==='POST') {posts++; assert.equal(JSON.parse(opts.body).inputs.refresh_request,request.requestId); return response({},204);}
    if(url.includes('/actions/runs/123')) return response(success(request));
    return response({workflow_runs:posts ? [success(request)] : []});
  };
  const first=await serviceImportRefresh({...options(f),fetchImpl});
  assert.equal(first.status,'waiting'); assert.equal(first.runId,undefined);
  const second=await serviceImportRefresh({...options(f),fetchImpl,now:NOW+60000});
  assert.equal(second.status,'ready'); assert.equal(second.runId,123); assert.equal(posts,1);
  assert.doesNotMatch(fs.readFileSync(f.file,'utf8'),/test-secret/);
});
test('lost dispatch response never causes a duplicate POST; correlation recovers completion',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW}); let posts=0;
  const fetchImpl=async(url,opts)=>{
    if(opts.method==='POST') {posts++; throw new Error('network timeout');}
    if(url.includes('/actions/runs/123')) return response(success(request));
    return response({workflow_runs:posts ? [success(request)] : []});
  };
  assert.equal((await serviceImportRefresh({...options(f),fetchImpl})).status,'dispatching');
  assert.equal((await serviceImportRefresh({...options(f),fetchImpl,now:NOW+60000})).status,'ready');
  assert.equal(posts,1);
});
test('failed import blocks readiness without consuming tester retries',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW});
  const failed={...success(request),conclusion:'failure'};
  const result=await serviceImportRefresh({...options(f),fetchImpl:async url=>response(url.includes('/actions/runs/123')?failed:{workflow_runs:[failed]})});
  assert.equal(result.status,'blocked'); assert.match(result.reason,/failure/);
  assert.equal(result.retries,undefined);
});
test('queued import remains waiting and does not redispatch',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW}); const run={...success(request),status:'queued',conclusion:null};
  const result=await serviceImportRefresh({...options(f),fetchImpl:async(url,opts)=>{assert.notEqual(opts.method,'POST'); return response(url.includes('/actions/runs/123')?run:{workflow_runs:[run]});}});
  assert.equal(result.status,'waiting');
});
test('timeout cannot be interpreted as an empty successful queue',async t=>{
  const f=fixture(t); requestImport(f.repo,{now:NOW});
  const result=await serviceImportRefresh({...options(f),now:NOW+900000,fetchImpl:async(url,opts)=>{
    assert.notEqual(opts.method,'POST'); return response({workflow_runs:[]});
  }});
  assert.equal(result.status,'blocked'); assert.match(result.reason,/timed out/);
  assert.equal(result.retryable,true);
  assert.notEqual(requestImport(f.repo,{now:NOW+901000}).requestId,result.requestId);
});

test('restart preserves expired correlation and recovers completed run without redispatch',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW});
  fs.writeFileSync(f.file,JSON.stringify({...request,status:'dispatching',dispatchAttemptedAt:new Date(NOW).toISOString()}));
  assert.equal(requestImport(f.repo,{now:NOW+3600000,force:true}).requestId,request.requestId);
  const result=await serviceImportRefresh({...options(f),now:NOW+3600000,fetchImpl:async(url,opts)=>{
    assert.notEqual(opts.method,'POST');
    return response(url.includes('/actions/runs/123')?success(request):{workflow_runs:[success(request)]});
  }});
  assert.equal(result.status,'ready');
  assert.equal(isFresh(result,config,NOW+3600000),false,'old success is not fresh import proof');
  assert.notEqual(requestImport(f.repo,{now:NOW+3600000}).requestId,request.requestId);
});

test('interrupted known run completed recently recovers fresh proof',async t=>{
  const f=fixture(t); const request=requestImport(f.repo,{now:NOW});
  fs.writeFileSync(f.file,JSON.stringify({...request,status:'waiting',runId:123}));
  const result=await serviceImportRefresh({...options(f),now:NOW+1200000,fetchImpl:async(url,opts)=>{
    assert.ok(url.endsWith('/actions/runs/123')); assert.notEqual(opts.method,'POST');
    return response({...success(request),updated_at:new Date(NOW+1190000).toISOString()});
  }});
  assert.equal(result.status,'ready'); assert.equal(isFresh(result,config,NOW+1200000),true);
});

test('expired queued run and network outage are bounded; remote failure is not retryable recovery',async t=>{
  for(const state of ['queued','network','failure','wrong-identity']) {
    const f=fixture(t); const request=requestImport(f.repo,{now:NOW});
    fs.writeFileSync(f.file,JSON.stringify({...request,status:'waiting',runId:123}));
    const result=await serviceImportRefresh({...options(f),now:NOW+1200000,fetchImpl:async()=>{
      if(state==='network') throw new Error('test-secret-never-printed');
      return response({...success(request),...(state==='queued'?{status:'queued'}:state==='failure'?{conclusion:'failure'}:{display_title:'wrong'})});
    }});
    assert.equal(result.status,'blocked');
    assert.equal(result.retryable===true,['queued','network'].includes(state));
    assert.doesNotMatch(fs.readFileSync(f.file,'utf8'),/test-secret/);
  }
});
test('permission failure is actionable; transient GET failure preserves request',async t=>{
  const f=fixture(t); requestImport(f.repo,{now:NOW});
  let result=await serviceImportRefresh({...options(f),fetchImpl:async()=>response({},503)});
  assert.equal(result.status,'requested');
  result=await serviceImportRefresh({...options(f),fetchImpl:async()=>response({},403)});
  assert.equal(result.status,'blocked'); assert.match(result.reason,/HTTP 403/);
});
test('malformed configuration and request cannot masquerade as a refresh success',t=>{
  for(const change of [{repository:'https://elsewhere.example'},{workflow:'../other.yml'},{freshnessMinutes:0},{timeoutMinutes:Infinity}]) assert.throws(()=>validateConfig({...config,...change}));
  const f=fixture(t); requestImport(f.repo,{now:NOW}); fs.writeFileSync(f.file,'{}');
  assert.throws(()=>requestImport(f.repo,{now:NOW}));
});
test('coordinator brief and publisher wire the gate without altering the launch prompt',()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const brief=fs.readFileSync(path.join(root,'docs/briefs/coordinator.md'),'utf8');
  const publisher=fs.readFileSync(path.join(root,'scripts/publish-agent-output.mjs'),'utf8');
  const importer=fs.readFileSync(path.join(root,'.github/workflows/import-ready-for-testing.yml'),'utf8');
  assert.match(brief,/jira-import-refresh\.mjs --request`/);
  assert.doesNotMatch(brief,/jira-import-refresh\.mjs --request --force/);
  assert.match(brief,/five-minute freshness window/);
  assert.match(brief,/never.*complete.*stale.*import/i);
  assert.match(brief,/one replacement request per coordinator invocation/);
  assert.match(brief,/importRecoveryUsed/);
  assert.match(brief,/Never automatically retry an explicit importer failure/);
  assert.match(publisher,/await serviceImportRefresh/);
  assert.match(importer,/run: node scripts\/check-criteria\.mjs/);
});
