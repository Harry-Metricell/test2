import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.TEST2_REPO || 'C:\\Users\\harry.piper\\Documents\\ChatGPT\\Test2-github';
const evidenceRoot = process.env.TEST2_EVIDENCE || 'C:\\Users\\harry.piper\\Documents\\V4-QA-evidence';
const stagingRoot = path.join(repo, '.agent-staging');
const publisherIndex = path.join(process.env.TEMP || '.', `test2-publisher-index-${process.pid}`);

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
  candidates.push('C:\\Users\\harry.piper\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd\\git.exe');
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
  const gitRoot = path.dirname(path.dirname(git));
  const execPath = path.join(gitRoot, 'mingw64', 'libexec', 'git-core');
  const binPath = path.join(gitRoot, 'mingw64', 'bin');
  return execFileSync(git, ['-C', repo, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_EXEC_PATH: execPath,
      GIT_INDEX_FILE: publisherIndex,
      PATH: `${binPath};${process.env.PATH || ''}`
    }
  }).trim();
}
function ensureRepoClean() {
  const changes = runGit(['status', '--porcelain'])
    .split(/\r?\n/)
    .filter(line => line && !line.endsWith(' .agent-staging/') && !line.includes(' .agent-staging/'))
    .join('\n');
  if (changes) fail(`Repository has unrelated local changes:\n${changes}`);
}
function syncBeforePublish() {
  runGit(['fetch', 'origin', 'main']);
}
function pushWithRetry() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      runGit(['push', 'origin', 'main']);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      runGit(['fetch', 'origin', 'main']);
      runGit(['rebase', 'origin/main']);
    }
  }
}
function ensurePath(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function copyFolder(source, target) {
  if (fs.existsSync(source)) fs.cpSync(source, target, { recursive: true, force: true });
}
function cleanupRun(run, directFile) {
  try {
    fs.rmSync(run, { force: true, recursive: !directFile });
    return true;
  } catch (error) {
    console.warn(`Published but temporary cleanup is pending: ${error.code || error.message}`);
    return false;
  }
}
function nonEmpty(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}
function pngEvidence(key) {
  const dir = path.join(evidenceRoot, key, 'screenshots');
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some(name => name.toLowerCase().endsWith('.png') && nonEmpty(path.join(dir, name)));
}
function buildVerifiedReport(key, run) {
  const python = process.env.TEST2_PYTHON || 'C:\\Users\\harry.piper\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
  const template = process.env.TEST2_TEMPLATE || 'C:\\Users\\harry.piper\\Downloads\\Automated Test Case Template.docx';
  const builder = path.join(repo, 'scripts', 'build-evidence-report.py');
  const renderer = path.join(repo, 'scripts', 'render-docx-to-pdf.ps1');
  const reviewFile = path.join(run, 'review-output.json');
  const docx = path.join(run, 'report.docx');
  const pdf = path.join(run, 'report.pdf');
  const screenshots = path.join(evidenceRoot, key, 'screenshots');
  execFileSync(python, [builder, '--template', template, '--review-output', reviewFile, '--criteria', path.join(repo, 'tickets', key, 'criteria.md'), '--results', path.join(repo, 'tickets', key, 'results.json'), '--screenshots', screenshots, '--output', docx], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(docx)) fail('Template report generation completed without a non-empty DOCX');
  execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', renderer, '-InputDocx', docx, '-OutputPdf', pdf], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(pdf)) fail('Template PDF conversion completed without a non-empty PDF');
  return { docx, pdf };
}

if (!fs.existsSync(stagingRoot)) process.exit(0);
// Use a private temporary index so unrelated checkout changes and index locks do not block publishing.
fs.rmSync(publisherIndex, { force: true });
runGit(['read-tree', 'HEAD']);
syncBeforePublish();

const runs = fs.readdirSync(stagingRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() || entry.isFile())
  .map(entry => path.join(stagingRoot, entry.name))
  .sort();
const run = runs.find(candidate => {
  if (fs.statSync(candidate).isFile()) return true;
  return ['criteria-output.json', 'test-output.json', 'review-output.json']
    .some(name => fs.existsSync(path.join(candidate, name)));
});
if (!run) process.exit(0);

const directFile = fs.statSync(run).isFile();
const files = directFile
  ? [path.basename(run)]
  : ['criteria-output.json', 'test-output.json', 'review-output.json']
      .filter(name => fs.existsSync(path.join(run, name)));
if (files.length !== 1) fail(`Expected exactly one output file in ${run}; found ${files.join(', ') || 'none'}`);
const output = readJson(directFile ? run : path.join(run, files[0]));
const outputType = files[0].endsWith('criteria-output.json') || output.criteriaMarkdown ? 'criteria-output.json'
  : files[0].endsWith('test-output.json') || output.results ? 'test-output.json'
  : 'review-output.json';
const key = ticketKey(output.ticket);
const ticketDir = path.join(repo, 'tickets', key);
const statusFile = path.join(ticketDir, 'status.json');
if (!fs.existsSync(statusFile)) fail(`Missing status file for ${key}`);
const status = readJson(statusFile);
if (output.handoffId && !String(output.handoffId).startsWith(`handoff-${key}-`)) fail('Handoff does not match ticket');

const changed = [];
if (outputType === 'criteria-output.json') {
  if (typeof output.criteriaMarkdown !== 'string' || !output.criteriaMarkdown.trim()) fail('criteriaMarkdown is missing');
  ensurePath(path.join(ticketDir, 'criteria.md'));
  fs.writeFileSync(path.join(ticketDir, 'criteria.md'), `${output.criteriaMarkdown.trim()}\n`, 'utf8');
  status.qaStatus = output.qaStatus || 'Ready for Testing';
  status.blockedStage = output.qaStatus === 'Blocked' ? 'criteria' : null;
  writeJson(statusFile, status);
  changed.push(`tickets/${key}/criteria.md`, `tickets/${key}/status.json`);
} else if (outputType === 'test-output.json') {
  if (!output.results || typeof output.results !== 'object') fail('results is missing');
  if (typeof output.conciseReport !== 'string') fail('conciseReport is missing');
  writeJson(path.join(ticketDir, 'results.json'), output.results);
  fs.writeFileSync(path.join(ticketDir, 'report.md'), `${output.conciseReport.trim()}\n`, 'utf8');
  status.qaStatus = output.qaStatus || 'Awaiting Evidence Review';
  if (output.qaStatus === 'Blocked') {
    status.blockedStage = 'testing';
  } else {
    status.blockedStage = null;
  }
  writeJson(statusFile, status);
  if (!directFile) copyFolder(path.join(run, 'screenshots'), path.join(evidenceRoot, key, 'screenshots'));
  changed.push(`tickets/${key}/results.json`, `tickets/${key}/report.md`, `tickets/${key}/status.json`);
} else {
  if (!Array.isArray(output.criterionOutcomes)) fail('criterionOutcomes is missing');
  const review = { ...output };
  const pdf = path.join(run, 'report.pdf');
  try {
    if (!nonEmpty(pdf)) {
      if (!pngEvidence(key)) fail('Screenshots are required before report generation');
      buildVerifiedReport(key, run);
    }
  } catch (error) {
    review.overallOutcome = 'Blocked';
    review.qaStatus = 'Blocked';
    review.reportPath = '';
    review.reason = `Report generation or PDF verification failed: ${error.message}`;
  }
  writeJson(path.join(ticketDir, 'review.json'), review);
  status.qaStatus = review.qaStatus || 'Evidence Reviewed';
  writeJson(statusFile, status);
  if (!directFile) {
    copyFolder(path.join(run, 'report.docx'), path.join(evidenceRoot, key, 'reports', `${key}.docx`));
    copyFolder(path.join(run, 'report.pdf'), path.join(evidenceRoot, key, 'reports', `${key}.pdf`));
    if (nonEmpty(path.join(run, 'report.pdf'))) {
      copyFolder(path.join(run, 'report.pdf'), path.join(repo, 'tickets', key, 'report.pdf'));
      changed.push(`tickets/${key}/report.pdf`);
    }
  }
  changed.push(`tickets/${key}/review.json`, `tickets/${key}/status.json`);
}

runGit(['add', '--', ...changed]);
if (!runGit(['diff', '--cached', '--name-only'])) {
  const remote = runGit(['ls-remote', 'origin', 'refs/heads/main']);
  if (!remote) fail('GitHub remote read-back returned no main ref');
  const cleaned = cleanupRun(run, directFile);
  console.log(JSON.stringify({ ticket: key, changedFiles: [], published: true, noOp: true, cleaned, cleanupPath: run }));
  process.exit(0);
}
runGit(['commit', '-m', `Publish TEST2 ${key} agent output`]);
pushWithRetry();
const remote = runGit(['ls-remote', 'origin', 'refs/heads/main']);
if (!remote) fail('GitHub remote read-back returned no main ref');
const cleaned = cleanupRun(run, directFile);
fs.rmSync(publisherIndex, { force: true });
console.log(JSON.stringify({ ticket: key, changedFiles: changed, published: true, cleaned, cleanupPath: run }));


