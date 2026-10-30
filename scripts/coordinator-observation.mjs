// Private progress hint only. Never establishes worker liveness or publication.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function observeCoordinator(state, readCheckpoint, previousDigest) {
  if (!state || !Array.isArray(state.active) || state.active.length > 100) throw new Error('Invalid coordinator state');
  const active = state.active.map(record => {
    if (!/^TEST2-\d+$/.test(record.ticket || '')
        || !/^handoff-TEST2-\d+(?:-[a-z0-9]+)+$/.test(record.handoffId || '')
        || !record.handoffId.startsWith(`handoff-${record.ticket}-`)) throw new Error('Invalid active identity');
    const checkpoint = readCheckpoint(record.handoffId);
    const item = { ticket: record.ticket, handoffId: record.handoffId };
    if (checkpoint === null) return { ...item, checkpoint: 'absent' };
    if (!checkpoint || checkpoint.handoffId !== record.handoffId
        || !Array.isArray(checkpoint.completedResults)) throw new Error('Invalid tester checkpoint');
    const counts = { Passed: 0, Failed: 0, Blocked: 0, Unverified: 0 };
    for (const result of checkpoint.completedResults) {
      if (!Object.hasOwn(counts, result?.outcome)) throw new Error('Invalid checkpoint outcome');
      counts[result.outcome]++;
    }
    return { ...item, checkpoint: 'present', completed: checkpoint.completedResults.length, outcomes: counts,
      currentCriterion: Number.isSafeInteger(checkpoint.currentCriterion) ? checkpoint.currentCriterion : null,
      browserOperationPending: checkpoint.browserOperationPending === true,
      recoveryUsed: checkpoint.recoveryUsed === true };
  }).sort((a, b) => a.handoffId.localeCompare(b.handoffId));
  // Ignore timestamps, commentary and result text. Emit no URLs, tokens or evidence.
  const digest = createHash('sha256').update(JSON.stringify(active)).digest('hex');
  return digest === previousDigest ? { changed: false, digest }
    : { changed: true, digest, authority: 'local_hint_only', active };
}

function main() {
  const args = process.argv.slice(2);
  const option = key => { const index = args.indexOf(key); return index < 0 ? undefined : args[index + 1]; };
  const staging = path.resolve(option('--repo') || '.', '.agent-staging');
  const read = filename => JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
  // Missing/unreadable state is an error, never an empty queue or completion.
  const state = read(path.join(staging, 'coordinator-run-state.json'));
  const observation = observeCoordinator(state, handoff => {
    try { return read(path.join(staging, handoff, 'tester-checkpoint.json')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }, option('--previous'));
  console.log(JSON.stringify(observation));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch { console.error(JSON.stringify({ error: 'local_observation_unavailable' })); process.exitCode = 1; }
}
