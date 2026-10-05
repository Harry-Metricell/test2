// Retire tester bookkeeping only from a fresh committed remote snapshot.
// Task-service availability and reusable results.json are not completion gates.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function reconcilePublishedTests(state, handoffs, histories) {
  if (!state || !Array.isArray(state.active) || !Array.isArray(handoffs)) throw new Error('Invalid coordinator state or handoff snapshot');
  const retired = [];
  const active = state.active.filter(record => {
    if (record.stage !== 'test_ticket' || !/^TEST2-\d+$/.test(record.ticket || '')) return true;
    if (handoffs.some(handoff => handoff.handoffId === record.handoffId)) return true;
    const published = histories(record.ticket).some(output => output?.handoffId === record.handoffId
      && output.ticket === record.ticket && output.noOp !== true && Array.isArray(output.results) && output.results.length > 0);
    if (published) retired.push(record.handoffId);
    return !published;
  });
  return { state: { ...state, active }, retired };
}

export function validateRecoverySnapshot(snapshot, now = Date.now()) {
  const age = now - Date.parse(snapshot?.fetchedAt);
  if (snapshot?.schema !== 'v4-qa-recovery-snapshot.v1'
      || !/^[a-f0-9]{40}$/i.test(snapshot.commit || '')
      || !Number.isFinite(age) || age < -30000 || age > 300000
      || snapshot.bundlerSucceeded !== true || !Array.isArray(snapshot.handoffs)
      || snapshot.handoffs.some(item => !item || typeof item.handoffId !== 'string')
      || !snapshot.histories || typeof snapshot.histories !== 'object' || Array.isArray(snapshot.histories)
      || Object.values(snapshot.histories).some(value => !Array.isArray(value))) {
    throw new Error('Recovery needs a fresh, complete, commit-pinned connector snapshot with successful bundler verification');
  }
  return snapshot;
}

function main() {
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const repo = path.resolve(option('--repo') || '.');
  const statePath = path.resolve(option('--state') || path.join(repo, '.agent-staging/coordinator-run-state.json'));
  const state = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8').replace(/^\uFEFF/, ''))
    : { schema: 'v4-qa-coordinator-run-state.v1', active: [] };
  if (!Array.isArray(state.active)) throw new Error('Invalid coordinator active state');
  if (!state.active.some(record => record.stage === 'test_ticket')) {
    console.log(JSON.stringify({ retired: [], active: state.active.length, reason: 'no_test_entries', applied: false }));
    return;
  }
  const git = process.env.TEST2_GIT || 'git';
  const runGit = (...values) => execFileSync(git, ['-C', repo, ...values], { encoding: 'utf8', windowsHide: true });
  let commit, handoffs, histories;
  if (option('--snapshot')) {
    // No subprocess/network calls: connector reads work when sandboxed Git
    // spawning does not. Callers fetch every file at the same immutable ref.
    const snapshot = validateRecoverySnapshot(JSON.parse(fs.readFileSync(option('--snapshot'), 'utf8').replace(/^\uFEFF/, '')));
    ({ commit, handoffs } = snapshot);
    histories = ticket => {
      if (!Object.hasOwn(snapshot.histories, ticket)) throw new Error(`Recovery snapshot lacks ${ticket} history`);
      return snapshot.histories[ticket];
    };
  } else {
    // Abort on fetch/read/JSON errors: an unavailable queue is not proof.
    runGit('fetch', 'origin', 'main');
    commit = runGit('rev-parse', 'FETCH_HEAD').trim();
    const remoteJson = file => JSON.parse(runGit('show', `${commit}:${file}`));
    handoffs = remoteJson('status/handoffs.json').handoffs;
    histories = ticket => runGit('ls-tree', '-r', '--name-only', commit, `tickets/${ticket}/history`)
      .trim().split(/\r?\n/).filter(file => /\/attempt-\d+-test\.json$/.test(file)).map(remoteJson);
  }
  const result = reconcilePublishedTests(state, handoffs, histories);
  if (args.includes('--apply') && result.retired.length) {
    fs.copyFileSync(statePath, `${statePath}.before-reconcile-${Date.now()}.json`);
    fs.writeFileSync(statePath, JSON.stringify(result.state, null, 2) + '\n');
  }
  console.log(JSON.stringify({ commit, retired: result.retired, active: result.state.active.length, applied: args.includes('--apply') }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
