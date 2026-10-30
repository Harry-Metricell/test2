// Screenshot names are allocated once; sealing records their original bytes.
// The browser still captures the real page through the configured Playwright MCP.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function runFolder(root, handoff) {
  if (!/^handoff-TEST2-\d+-(?:cycle-\d{3,}-)?(?:test|retry)(?:-attempt-\d+)?$/.test(handoff || '')) throw Error('Invalid tester handoff');
  const run = path.join(root, handoff);
  // Refuse links at every existing component, including a custom staging root.
  for (let p = path.resolve(run); ; p = path.dirname(p)) {
    if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink()) throw Error('Capture folders must not be symbolic links');
    if (path.dirname(p) === p) break;
  }
  return run;
}
function ledger(run) {
  const dir = path.join(run, 'capture-ledger');
  if (fs.existsSync(dir) && fs.lstatSync(dir).isSymbolicLink()) throw Error('Capture ledger must not be a symbolic link');
  return dir;
}
function digest(file) {
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw Error('Capture is missing or not a regular file');
  const bytes = fs.readFileSync(file);
  if (bytes.length <= 8 || !bytes.subarray(0, 8).equals(signature)) throw Error('Capture is not a non-empty PNG');
  return { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
}
function captureFile(run, name) {
  if (!/^criterion-[1-9]\d*-[a-z0-9-]+-[a-f0-9-]{36}\.png$/.test(name || '') || name !== path.basename(name)) throw Error('Invalid allocated capture name');
  const shots = path.join(run, 'screenshots');
  if (fs.existsSync(shots) && fs.lstatSync(shots).isSymbolicLink()) throw Error('Capture folder must not be a symbolic link');
  return path.join(shots, name);
}
export function reserveCapture(root, handoff, criterion, phase) {
  if (!/^[1-9]\d*$/.test(String(criterion)) || !/^[a-z][a-z0-9-]{0,60}$/.test(phase || '')) throw Error('Use a positive criterion and a short lowercase capture phase');
  const run = runFolder(root, handoff), dir = ledger(run);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(run, 'screenshots'), { recursive: true });
  // A UUID also separates a resumed criterion from its incomplete earlier capture.
  const name = `criterion-${criterion}-${phase}-${randomUUID()}.png`;
  const file = captureFile(run, name);
  if (fs.existsSync(file)) throw Error('Allocated screenshot already exists');
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ handoff, criterion: Number(criterion), phase, name }), { flag: 'wx' });
  return { filename: `${handoff}/screenshots/${name}`, name };
}
export function sealCapture(root, handoff, name) {
  const run = runFolder(root, handoff), dir = ledger(run), file = captureFile(run, name);
  const reservation = JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'));
  if (reservation.handoff !== handoff || reservation.name !== name) throw Error('Capture reservation does not match');
  const proof = { ...reservation, ...digest(file) }, sealed = path.join(dir, `${name}.sealed.json`);
  try { fs.writeFileSync(sealed, JSON.stringify(proof), { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const prior = JSON.parse(fs.readFileSync(sealed, 'utf8'));
    if (prior.sha256 !== proof.sha256 || prior.bytes !== proof.bytes) throw Error(`Capture was overwritten: ${name}`);
  }
  return { sealed: true, name, sha256: proof.sha256 };
}
export function verifyCaptures(root, handoff, results = null) {
  const run = runFolder(root, handoff), dir = ledger(run);
  // Legacy staged output stays publishable; new workers always reserve captures.
  if (!fs.existsSync(dir)) return { legacy: true, verified: 0 };
  const names = results
    ? results.flatMap((item, index) => (item.evidence || []).map(ref => ({ name: path.win32.basename(String(ref)), criterion: index + 1 })))
    : fs.readdirSync(dir).filter(n => n.endsWith('.sealed.json')).map(n => ({ name: n.slice(0, -12) }));
  for (const { name, criterion } of names) {
    const file = captureFile(run, name);
    const proof = JSON.parse(fs.readFileSync(path.join(dir, `${name}.sealed.json`), 'utf8'));
    const actual = digest(file);
    if (proof.handoff !== handoff || proof.name !== name || (criterion && proof.criterion !== criterion)
        || actual.sha256 !== proof.sha256 || actual.bytes !== proof.bytes) throw Error(`Capture integrity failed: ${name}`);
  }
  return { verified: names.length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.env.TEST2_STAGING_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.agent-staging');
  const [command, handoff, numberOrName, phase] = process.argv.slice(2);
  try {
    const result = command === '--reserve' ? reserveCapture(root, handoff, numberOrName, phase)
      : command === '--seal' ? sealCapture(root, handoff, numberOrName)
      : command === '--verify' ? verifyCaptures(root, handoff)
      : (() => { throw Error('Use --reserve <handoff> <criterion> <phase>, --seal <handoff> <name>, or --verify <handoff>'); })();
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
