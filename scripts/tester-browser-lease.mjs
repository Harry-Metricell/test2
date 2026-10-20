/** One cooperating TEST2 tester owns the shared MCP browser for its attempt.
 * Atomic directory creation prevents races across coordinator chats. A lease
 * never expires by age: release requires its handoff and unguessable token.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const validHandoff = value => /^handoff-TEST2-\d+-(?:cycle-\d{3,}-)?(?:test|retry)(?:-attempt-\d+)?$/.test(value || '');
const lockPath = root => path.join(root, 'tester-browser.lock');

export function leaseStatus(root) {
  const folder = lockPath(root);
  if (!fs.existsSync(folder)) return { busy: false };
  try {
    const owner = JSON.parse(fs.readFileSync(path.join(folder, 'owner.json'), 'utf8'));
    return { busy: true, handoffId: owner.handoffId, acquiredAt: owner.acquiredAt };
  } catch { return { busy: true, reason: 'lease_owner_unavailable' }; }
}

export function acquireLease(root, handoffId) {
  if (!validHandoff(handoffId)) throw new Error('A valid tester handoff ID is required');
  fs.mkdirSync(root, { recursive: true });
  try { fs.mkdirSync(lockPath(root)); }
  catch (error) {
    if (error.code === 'EEXIST') return { acquired: false, reason: 'browser_in_use', ...leaseStatus(root) };
    throw error;
  }
  const owner = { handoffId, token: crypto.randomUUID(), acquiredAt: new Date().toISOString() };
  try { fs.writeFileSync(path.join(lockPath(root), 'owner.json'), JSON.stringify(owner) + '\n', { flag: 'wx' }); }
  catch (error) { fs.rmdirSync(lockPath(root)); throw error; }
  return { acquired: true, ...owner };
}

export function releaseLease(root, handoffId, token) {
  if (!validHandoff(handoffId) || !token) throw new Error('Release requires the tester handoff and token');
  const folder = lockPath(root);
  let owner;
  try { owner = JSON.parse(fs.readFileSync(path.join(folder, 'owner.json'), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT' && !fs.existsSync(folder)) return { released: false, reason: 'no_lease' };
    throw new Error('Cannot read the browser lease; preserve it for coordinator recovery');
  }
  if (owner.handoffId !== handoffId || owner.token !== token) throw new Error('Browser lease belongs to another tester');
  fs.unlinkSync(path.join(folder, 'owner.json'));
  fs.rmdirSync(folder);
  return { released: true, handoffId };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.env.TEST2_STAGING_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.agent-staging');
  const [command, handoffId, token] = process.argv.slice(2);
  try {
    const result = command === '--status' ? leaseStatus(root)
      : command === '--acquire' ? acquireLease(root, handoffId)
      : command === '--release' ? releaseLease(root, handoffId, token)
      : (() => { throw new Error('Use --status, --acquire <handoffId>, or --release <handoffId> <token>'); })();
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
