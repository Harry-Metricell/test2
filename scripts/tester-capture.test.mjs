import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { reserveCapture, sealCapture, verifyCaptures } from './tester-capture.mjs';
const handoff = 'handoff-TEST2-89-cycle-005-test-attempt-001';
const png = Buffer.from([137,80,78,71,13,10,26,10,1,2,3,4]);
function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-capture-'));
  try { fn(root); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
test('repeated final captures keep different files and survive resume', () => fixture(root => {
  const a = reserveCapture(root, handoff, 2, 'final');
  fs.writeFileSync(path.join(root, a.filename), png); sealCapture(root, handoff, a.name);
  const b = reserveCapture(root, handoff, 2, 'final');
  assert.notEqual(a.name, b.name);
  fs.writeFileSync(path.join(root, b.filename), Buffer.concat([png, Buffer.from([5])])); sealCapture(root, handoff, b.name);
  assert.deepEqual(fs.readFileSync(path.join(root, a.filename)), png);
  assert.equal(verifyCaptures(root, handoff).verified, 2);
  assert.equal(verifyCaptures(root, handoff, [{ evidence: [] }, { evidence: [a.filename, b.filename] }]).verified, 2);
}));
test('an overwritten sealed image fails both reseal and publication checks', () => fixture(root => {
  const a = reserveCapture(root, handoff, 1, 'selected-detail');
  fs.writeFileSync(path.join(root, a.filename), png); sealCapture(root, handoff, a.name);
  fs.appendFileSync(path.join(root, a.filename), 'changed');
  assert.throws(() => sealCapture(root, handoff, a.name), /overwritten/);
  assert.throws(() => verifyCaptures(root, handoff, [{ evidence: [a.filename] }]), /integrity/);
}));
test('missing, unsealed, foreign criterion and unsafe captures fail closed', () => fixture(root => {
  assert.throws(() => reserveCapture(root, '../escape', 1, 'final'), /handoff/);
  assert.throws(() => reserveCapture(root, handoff, 0, '../final'), /criterion/);
  const a = reserveCapture(root, handoff, 2, 'selected-detail');
  assert.throws(() => sealCapture(root, handoff, a.name), /missing/);
  fs.writeFileSync(path.join(root, a.filename), png);
  assert.throws(() => verifyCaptures(root, handoff, [{ evidence: [] }, { evidence: [a.filename] }]), /ENOENT/);
  sealCapture(root, handoff, a.name);
  assert.throws(() => verifyCaptures(root, handoff, [{ evidence: [a.filename] }]), /integrity/);
  assert.deepEqual(verifyCaptures(root, 'handoff-TEST2-80-test'), { legacy: true, verified: 0 });
}));
