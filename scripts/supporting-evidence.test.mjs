import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { copySupportingEvidence } from './supporting-evidence.mjs';
function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-support-'));
  try {
    const run=path.join(root,'run'), dest=path.join(root,'private');
    fs.mkdirSync(path.join(run,'supporting'),{recursive:true});
    const bytes=Buffer.from('Time,Value\n12:00,3\n');
    fs.writeFileSync(path.join(run,'supporting/criterion-1-export.csv'),bytes);
    const ref={path:'supporting/criterion-1-export.csv',sha256:createHash('sha256').update(bytes).digest('hex'),kind:'csv',description:'Selected test export'};
    fn({run,dest,ref});
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
}
test('private evidence is hash-checked, criterion-scoped and idempotent',()=>fixture(({run,dest,ref})=>{
  const input=[{supportingEvidence:[ref]}];
  const out=copySupportingEvidence(input,run,dest,'cycles/cycle-005/supporting/attempt-001/');
  assert.equal(out[0].supportingEvidence[0].path,'cycles/cycle-005/supporting/attempt-001/criterion-1-export.csv');
  assert.equal(input[0].supportingEvidence[0].path,ref.path);
  assert.equal(fs.readFileSync(path.join(dest,'criterion-1-export.csv'),'utf8'),'Time,Value\n12:00,3\n');
  assert.deepEqual(copySupportingEvidence(input,run,dest,'cycles/cycle-005/supporting/attempt-001/'),out);
  fs.writeFileSync(path.join(dest,'criterion-1-export.csv'),'different');
  assert.throws(()=>copySupportingEvidence(input,run,dest,''),/collision/);
}));
test('invalid identity, traversal, hashes and duplicate references fail before copying',()=>fixture(({run,dest,ref})=>{
  for(const bad of [{...ref,path:'../secret.json'},{...ref,path:'supporting/criterion-2-export.csv'},{...ref,sha256:'0'.repeat(64)},{...ref,kind:'credentials'}]) {
    assert.throws(()=>copySupportingEvidence([{supportingEvidence:[bad]}],run,dest,''));
    assert.equal(fs.existsSync(dest),false);
  }
  assert.throws(()=>copySupportingEvidence([{supportingEvidence:[ref,ref]}],run,dest,''));
  assert.equal(fs.existsSync(dest),false);
}));
