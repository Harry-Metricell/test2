import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.TEST2_REPO || 'C:\\Users\\harry.piper\\Documents\\ChatGPT\\Test2-github';
const evidenceRoot = process.env.TEST2_EVIDENCE || 'C:\\Users\\harry.piper\\Documents\\V4-QA-evidence';
const stagingRoot = path.join(repo, '.agent-staging');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function fail(message) { throw new Error(message); }
function ticketKey(value) {
  if (!/^TEST2-[0-9]+$/.test(value || '')) fail(`Invalid ticket key: ${value}`);
  return value;
}
function gitPath() {
  const candidates = [];
  if (process.env.TEST2_GIT) candidates.push(process.env.TEST2_GIT);
  const desktop = path.join(process.env.LOCALAPPDATA || '', 'GitHubDesktop');
  if (fs.existsSync(desktop)) {
    for (const entry of fs.readdirSync(desktop, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith('app-')) {
        candidates.push(path.join(desktop, entry.name, 'resources', 'app', 'git', 'cmd', 'git.exe'));
      }
    }
  }
  candidates.push('C:\\Program Files\\Git\\cmd\\git.exe', 'git');
  return candidates.find(candidate => candidate === 'git' || fs.existsSync(candidate)) || 'git';
}
const git = gitPath();
function runGit(args) {
  return execFileSync(git, ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function ensureRepoClean() {
  const changes = runGit(['status', '--porcelain'])
    .split(/\r?\n/)
    .filter(line => line && !line.endsWith(' .agent-staging/') && !line.includes(' .agent-staging/'))
    .join('\n');
  if (changes) fail(`Repository has unrelated local changes:\n${changes}`);
}
function ensurePath(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function copyFolder(source, target) {
  if (fs.existsSync(source)) fs.cpSync(source, target, { recursive: true, force: true });
}

if (!fs.existsSync(stagingRoot)) process.exit(0);
ensureRepoClean();
const runs = fs.readdirSync(stagingRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => path.join(stagingRoot, entry.name))
  .sort();
const run = runs.find(dir => fs.existsSync(path.join(dir, 'criteria-output.json')) || fs.existsSync(path.join(dir, 'test-output.json')) || fs.existsSync(path.join(dir, 'review-output.json')));
if (!run) process.exit(0);

const files = ['criteria-output.json', 'test-output.json', 'review-output.json'].filter(name => fs.existsSync(path.join(run, name)));
if (files.length !== 1) fail(`Expected exactly one output file in ${run}; found ${files.join(', ') || 'none'}`);
const output = readJson(path.join(run, files[0]));
const key = ticketKey(output.ticket);
const ticketDir = path.join(repo, 'tickets', key);
const statusFile = path.join(ticketDir, 'status.json');
if (!fs.existsSync(statusFile)) fail(`Missing status file for ${key}`);
const status = readJson(statusFile);
if (output.handoffId && !String(output.handoffId).startsWith(`handoff-${key}-`)) fail('Handoff does not match ticket');

const changed = [];
if (files[0] === 'criteria-output.json') {
  if (typeof output.criteriaMarkdown !== 'string' || !output.criteriaMarkdown.trim()) fail('criteriaMarkdown is missing');
  ensurePath(path.join(ticketDir, 'criteria.md'));
  fs.writeFileSync(path.join(ticketDir, 'criteria.md'), `${output.criteriaMarkdown.trim()}\n`, 'utf8');
  status.qaStatus = output.qaStatus || 'Ready for Testing';
  writeJson(statusFile, status);
  changed.push(`tickets/${key}/criteria.md`, `tickets/${key}/status.json`);
} else if (files[0] === 'test-output.json') {
  if (!output.results || typeof output.results !== 'object') fail('results is missing');
  if (typeof output.conciseReport !== 'string') fail('conciseReport is missing');
  writeJson(path.join(ticketDir, 'results.json'), output.results);
  fs.writeFileSync(path.join(ticketDir, 'report.md'), `${output.conciseReport.trim()}\n`, 'utf8');
  status.qaStatus = output.qaStatus || 'Awaiting Evidence Review';
  writeJson(statusFile, status);
  copyFolder(path.join(run, 'screenshots'), path.join(evidenceRoot, key, 'screenshots'));
  changed.push(`tickets/${key}/results.json`, `tickets/${key}/report.md`, `tickets/${key}/status.json`);
} else {
  if (!Array.isArray(output.criterionOutcomes)) fail('criterionOutcomes is missing');
  writeJson(path.join(ticketDir, 'review.json'), output);
  status.qaStatus = output.qaStatus || 'Evidence Reviewed';
  writeJson(statusFile, status);
  copyFolder(path.join(run, 'report.docx'), path.join(evidenceRoot, key, 'reports', `${key}.docx`));
  changed.push(`tickets/${key}/review.json`, `tickets/${key}/status.json`);
}

runGit(['add', '--', ...changed]);
runGit(['commit', '-m', `Publish TEST2 ${key} agent output`]);
runGit(['push', 'origin', 'main']);
const remote = runGit(['ls-remote', 'origin', 'refs/heads/main']);
if (!remote) fail('GitHub remote read-back returned no main ref');
fs.rmSync(run, { recursive: true, force: true });
console.log(JSON.stringify({ ticket: key, changedFiles: changed, published: true, cleaned: run }));

