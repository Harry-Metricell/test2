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

function main() {
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const repo = path.resolve(option('--repo') || '.');
  const statePath = path.resolve(option('--state') || path.join(repo, '.agent-staging/coordinator-run-state.json'));
  const git = process.env.TEST2_GIT || 'git';
  const runGit = (...values) => execFileSync(git, ['-C', repo, ...values], { encoding: 'utf8', windowsHide: true });
  // Abort on fetch/read/JSON errors: an empty or unavailable queue is not proof.
  runGit('fetch', 'origin', 'main');
  const commit = runGit('rev-parse', 'FETCH_HEAD').trim();
  const remoteJson = file => JSON.parse(runGit('show', `${commit}:${file}`));
  const handoffs = remoteJson('status/handoffs.json').handoffs;
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8').replace(/^\uFEFF/, ''));
  const result = reconcilePublishedTests(state, handoffs, ticket => {
    const files = runGit('ls-tree', '-r', '--name-only', commit, `tickets/${ticket}/history`).trim().split(/\r?\n/)
      .filter(file => /\/attempt-\d+-test\.json$/.test(file));
    return files.map(remoteJson);
  });
  if (args.includes('--apply') && result.retired.length) {
    fs.copyFileSync(statePath, `${statePath}.before-reconcile-${Date.now()}.json`);
    fs.writeFileSync(statePath, JSON.stringify(result.state, null, 2) + '\n');
  }
  console.log(JSON.stringify({ commit, retired: result.retired, active: result.state.active.length, applied: args.includes('--apply') }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
