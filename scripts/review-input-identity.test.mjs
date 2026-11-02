import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { reviewInputHandoff } from './review-input-identity.mjs';
import { publicationStillCurrent } from './testing-cycle.mjs';
const handoff={handoffId:'handoff-TEST2-99-review-attempt-001',handoffVersion:'TEST2-99:evidence_review:1:scope-abc123',ticket:'TEST2-99',action:'evidence_review',attempt:1,cycleId:'cycle-001'};
const input={results:[{criterion:'Visible marker',outcome:'Passed',supportingEvidence:[{path:'proof.json',sha256:'a'.repeat(64)}]}],criteria:'- [ ] Visible marker.\n'};
test('unchanged inputs keep one identity across formatting and repeated generation',()=>{
  const a=reviewInputHandoff(handoff,input);
  assert.deepEqual(reviewInputHandoff(a,input),a);
  const reformatted={...input,criteria:'- [ ] Visible marker.\r\n',results:[{supportingEvidence:input.results[0].supportingEvidence,outcome:'Passed',criterion:'Visible marker'}]};
  assert.deepEqual(reviewInputHandoff(handoff,reformatted),a);
  assert.equal(a.attempt,1);assert.equal(a.cycleId,'cycle-001');assert.ok(a.handoffVersion.endsWith(':scope-abc123'));
});
test('changed results, supporting hashes, criteria or context get fresh review identities only',()=>{
  const a=reviewInputHandoff(handoff,input);
  for(const changed of [{...input,results:[{...input.results[0],outcome:'Failed'}]},
    {...input,results:[{...input.results[0],supportingEvidence:[{path:'proof.json',sha256:'b'.repeat(64)}]}]},
    {...input,criteria:'- [ ] Another required state.'},{...input,context:{targetModule:'Automobile'}}]) {
    const b=reviewInputHandoff(handoff,changed);assert.notEqual(a.handoffId,b.handoffId);assert.notEqual(a.handoffVersion,b.handoffVersion);assert.equal(b.attempt,1);
  }
  assert.equal(reviewInputHandoff({...handoff,action:'test_ticket'},input).handoffId,handoff.handoffId);
  assert.throws(()=>reviewInputHandoff(handoff,{results:[],criteria:'x'}));
});
test('publication rejects changed evidence even before the queued handoff is regenerated',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'test2-review-source-'));const dir=path.join(root,'tickets/TEST2-99');
  try{
    fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'status'));
    fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(input.results));fs.writeFileSync(path.join(dir,'criteria.md'),input.criteria);
    const h=reviewInputHandoff({...handoff,handoffVersion:'TEST2-99:evidence_review:1'},input);
    fs.writeFileSync(path.join(root,'status/handoffs.json'),JSON.stringify({handoffs:[h]}));
    assert.equal(publicationStillCurrent(root,h,'cycle-001','evidence_review'),true);
    fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify([{...input.results[0],outcome:'Failed'}]));
    assert.equal(publicationStillCurrent(root,h,'cycle-001','evidence_review'),false);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
