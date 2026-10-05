// The coordinator writes a private request. The trusted hidden publisher services
// it without exposing credentials or depending on GitHub's cron delivery.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SCHEMA = 'v4-qa-import-refresh.v1';
const requestName = 'jira-import-refresh.json';
const pending = new Set(['requested', 'dispatching', 'waiting']);
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
function save(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, file);
}

export function validateConfig(config) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(config?.repository || '')
      || !/^[A-Za-z0-9_./-]+$/.test(config.branch || '') || config.branch.includes('..')
      || !/^[A-Za-z0-9_-]+\.ya?ml$/.test(config.workflow || '')
      || !Number.isFinite(config.freshnessMinutes) || config.freshnessMinutes < 1 || config.freshnessMinutes > 15
      || !Number.isFinite(config.timeoutMinutes) || config.timeoutMinutes < 1 || config.timeoutMinutes > 30) {
    throw new Error('Invalid Jira import refresh configuration');
  }
  return config;
}

export function validateRequest(request) {
  if (request?.schema !== SCHEMA || !/^[a-f0-9-]{36}$/.test(request.requestId || '')
      || !Number.isFinite(Date.parse(request.requestedAt))
      || !['requested', 'dispatching', 'waiting', 'ready', 'blocked'].includes(request.status)) {
    throw new Error('Invalid Jira import refresh request');
  }
  return request;
}

export function isFresh(request, config, now = Date.now()) {
  const age = now - Date.parse(request?.completedAt);
  return request?.status === 'ready' && Number.isSafeInteger(request.runId) && request.runId > 0
    && Number.isFinite(age) && age >= -5000 && age <= config.freshnessMinutes * 60000;
}

export function requestImport(repo, { force = false, now = Date.now() } = {}) {
  const config = validateConfig(readJson(path.join(repo, 'config/jira-import-refresh.json')));
  const file = path.join(repo, '.agent-staging', requestName);
  const existing = fs.existsSync(file) ? validateRequest(readJson(file)) : undefined;
  if (existing && pending.has(existing.status) && now - Date.parse(existing.requestedAt) < config.timeoutMinutes * 60000) return existing;
  if (!force && isFresh(existing, config, now)) return existing;
  const request = { schema: SCHEMA, requestId: randomUUID(), requestedAt: new Date(now).toISOString(), status: 'requested' };
  save(file, request);
  return request;
}

export function validateCompletedRun(run, request, config) {
  const created = Date.parse(run?.created_at);
  const completed = Date.parse(run?.updated_at);
  if (!Number.isSafeInteger(run?.id) || run.id < 1 || run.head_branch !== config.branch
      || run.path?.split('@')[0] !== `.github/workflows/${config.workflow}`
      || !Number.isFinite(created) || created < Date.parse(request.requestedAt) - 5000
      || !Number.isFinite(completed) || completed < created
      || run.status !== 'completed' || run.conclusion !== 'success') {
    throw new Error('Import refresh needs a successful matching workflow run started after its request');
  }
  return { runId: run.id, completedAt: run.updated_at, runUrl: run.html_url };
}

function githubToken(git, repo) {
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  try {
    // Reuse the existing Desktop credential helper; never prompt or print its output.
    const root = path.dirname(path.dirname(git));
    const bin = path.join(root, 'mingw64', 'bin');
    const execPath = fs.existsSync(path.join(bin, 'git-remote-https.exe')) ? bin : path.join(root, 'mingw64', 'libexec', 'git-core');
    const credential = execFileSync(git, ['-C', repo, 'credential', 'fill'], {
      input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 15000,
      windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never', GIT_EXEC_PATH: execPath }
    });
    const token = credential.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
    if (!token) throw new Error('Missing credential');
    return token;
  } catch {
    throw new Error('Existing GitHub authentication is unavailable for Actions dispatch; no sign-in window was opened');
  }
}

export async function serviceImportRefresh({ repo, stagingRoot, git, tokenProvider, fetchImpl = fetch, now = Date.now() }) {
  const file = path.join(stagingRoot, requestName);
  if (!fs.existsSync(file)) return { status: 'idle' };
  const request = validateRequest(readJson(file));
  if (!pending.has(request.status)) return { status: request.status, runId: request.runId };
  const config = validateConfig(readJson(path.join(repo, 'config/jira-import-refresh.json')));
  const finish = value => { Object.assign(request, value, { observedAt: new Date(now).toISOString() }); save(file, request); return request; };
  if (now - Date.parse(request.requestedAt) >= config.timeoutMinutes * 60000) {
    return finish({ status: 'blocked', reason: 'Import refresh timed out; completion must not be claimed', retryable: true });
  }
  try {
    const token = tokenProvider ? await tokenProvider() : githubToken(git, repo);
    const api = async (endpoint, options = {}) => {
      const response = await fetchImpl(`https://api.github.com/repos/${config.repository}${endpoint}`, {
        ...options, redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'TEST2-import-refresh',
          'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = new Error(`GitHub import refresh request failed (HTTP ${response.status})`);
        error.permanent = response.status >= 400 && response.status < 500 && response.status !== 429;
        throw error;
      }
      return response.status === 204 ? {} : await response.json();
    };
    const title = `Coordinator import ${request.requestId}`;
    if (!request.runId) {
      const listing = await api(`/actions/workflows/${config.workflow}/runs?branch=${encodeURIComponent(config.branch)}&per_page=100`);
      if (!Array.isArray(listing.workflow_runs)) throw new Error('GitHub returned no usable importer run list');
      const match = listing.workflow_runs.find(run => run.display_title === title && run.head_branch === config.branch);
      if (match) finish({ status: 'waiting', runId: match.id });
      else if (!request.dispatchAttemptedAt) {
        // Persist before POST: a lost response must not dispatch duplicate imports.
        finish({ status: 'dispatching', dispatchAttemptedAt: new Date(now).toISOString() });
        const dispatched = await api(`/actions/workflows/${config.workflow}/dispatches`, {
          method: 'POST', body: JSON.stringify({ ref: config.branch, inputs: { refresh_request: request.requestId } })
        });
        finish({ status: 'waiting', ...(Number.isSafeInteger(dispatched.workflow_run_id) ? { runId: dispatched.workflow_run_id } : {}) });
      }
    }
    if (!request.runId) return finish({ status: 'waiting', reason: 'Awaiting the exact dispatched import run' });
    const run = await api(`/actions/runs/${request.runId}`);
    if (run.display_title !== title) throw Object.assign(new Error('Importer run identity does not match the refresh request'), { permanent: true });
    if (run.status !== 'completed') return finish({ status: 'waiting', reason: 'Importer is queued or running' });
    if (run.conclusion !== 'success') return finish({ status: 'blocked', reason: `Importer finished with ${run.conclusion || 'unknown outcome'}`, runUrl: run.html_url });
    let proof;
    try { proof = validateCompletedRun(run, request, config); }
    catch (error) { throw Object.assign(error, { permanent: true }); }
    return finish({ ...proof, status: 'ready', reason: 'Fresh Jira import completed successfully' });
  } catch (error) {
    // Do not log response bodies, credential subprocess output or token values.
    const safe = /^(GitHub import refresh request failed|Existing GitHub authentication|Importer run identity|Import refresh needs|GitHub returned)/.test(error.message)
      ? error.message : 'Import refresh could not contact or verify GitHub; retrying on the next publisher tick';
    return finish({ status: error.permanent || safe.startsWith('Existing GitHub authentication') ? 'blocked' : request.status, reason: safe });
  }
}

function main() {
  const args = process.argv.slice(2);
  const index = args.indexOf('--repo');
  const repo = path.resolve(index < 0 ? '.' : args[index + 1]);
  const file = path.join(repo, '.agent-staging', requestName);
  if (args.includes('--request')) console.log(JSON.stringify(requestImport(repo, { force: args.includes('--force') })));
  else if (args.includes('--status')) {
    const request = fs.existsSync(file) ? validateRequest(readJson(file)) : { status: 'missing' };
    const config = validateConfig(readJson(path.join(repo, 'config/jira-import-refresh.json')));
    console.log(JSON.stringify({ ...request, fresh: isFresh(request, config) }));
  }
  else throw new Error('Use --request [--force] or --status; this CLI never handles credentials or starts subprocesses');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
