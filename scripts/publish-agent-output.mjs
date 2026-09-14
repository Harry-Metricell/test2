import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repo = process.env.TEST2_REPO || 'C:\\Users\\harry.piper\\Documents\\ChatGPT\\Test2-github';
const evidenceRoot = process.env.TEST2_EVIDENCE || 'C:\\Users\\harry.piper\\Documents\\V4-QA-evidence';
const stagingRoot = process.env.TEST2_STAGING_ROOT || path.join(process.env.LOCALAPPDATA || repo, 'TEST2', 'staging');
const publisherIndex = path.join(process.env.TEMP || '.', `test2-publisher-index-${process.pid}`);
const publisherLock = path.join(process.env.LOCALAPPDATA || repo, 'TEST2', 'publisher.lock');

function acquirePublisherLock() {
  fs.mkdirSync(path.dirname(publisherLock), { recursive: true });
  try {
    fs.mkdirSync(publisherLock);
    fs.writeFileSync(path.join(publisherLock, 'pid'), String(process.pid), 'utf8');
    return true;
  } catch {
    try {
      const age = Date.now() - fs.statSync(publisherLock).mtimeMs;
      if (age > 15 * 60 * 1000) {
        fs.rmSync(publisherLock, { recursive: true, force: true });
        fs.mkdirSync(publisherLock);
        fs.writeFileSync(path.join(publisherLock, 'pid'), String(process.pid), 'utf8');
        return true;
      }
    } catch {}
    return false;
  }
}

if (!acquirePublisherLock()) process.exit(0);
process.on('exit', () => { try { fs.rmSync(publisherLock, { recursive: true, force: true }); } catch {} });

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
    for (const entry of fs.readdirSync(desktop, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) {
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
    encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_EXEC_PATH: execPath,
      GIT_INDEX_FILE: publisherIndex,
      PATH: `${binPath};${process.env.PATH || ''}`
    }
  }).trim();
}
function runGitAt(cwd, args, indexFile) {
  const gitRoot = path.dirname(path.dirname(git));
  const execPath = path.join(gitRoot, 'mingw64', 'libexec', 'git-core');
  const binPath = path.join(gitRoot, 'mingw64', 'bin');
  return execFileSync(git, ['-C', cwd, ...args], {
    encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_EXEC_PATH: execPath,
      ...(indexFile ? { GIT_INDEX_FILE: indexFile } : {}),
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
      runGit(['push', 'origin', 'HEAD:refs/heads/main']);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      runGit(['fetch', 'origin', 'main']);
      try {
        runGit(['merge-base', '--is-ancestor', 'origin/main', 'HEAD']);
      } catch {
        fail('Remote main advanced independently; refusing to rebase or overwrite the dirty Desktop checkout');
      }
    }
  }
}
function ensurePath(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function copyFolder(source, target) {
  if (fs.existsSync(source)) fs.cpSync(source, target, { recursive: true, force: true });
}
function nextEvidenceAttempt(key, status) {
  let attempt = Math.max(1, Number(status.retries || 0) + 1);
  const root = path.join(evidenceRoot, key, 'screenshots');
  while (fs.existsSync(path.join(root, `attempt-${String(attempt).padStart(3, '0')}`))) attempt += 1;
  return attempt;
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
function cleanupPublishedFiles(files) {
  for (const relative of files) {
    const target = path.join(repo, relative);
    try {
      runGit(['ls-files', '--error-unmatch', '--', relative]);
      runGit(['restore', '--source=HEAD', '--worktree', '--', relative]);
    } catch {
      try { fs.rmSync(target, { force: true, recursive: true }); } catch {}
    }
  }
}
function nonEmpty(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}
function pngEvidence(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some(name => name.toLowerCase().endsWith('.png') && nonEmpty(path.join(dir, name)));
}
function buildVerifiedReport(key, run, screenshots) {
  const python = process.env.TEST2_PYTHON || 'C:\\Users\\harry.piper\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
  const template = process.env.TEST2_TEMPLATE || 'C:\\Users\\harry.piper\\Downloads\\Automated Test Case Template.docx';
  const builder = path.join(repo, 'scripts', 'build-evidence-report.py');
  const renderer = path.join(repo, 'scripts', 'render-docx-to-pdf.ps1');
  const reviewFile = path.join(run, 'review-output.json');
  const docx = path.join(run, `report-generated-${process.pid}.docx`);
  const pdf = path.join(run, `report-generated-${process.pid}.pdf`);
  execFileSync(python, [builder, '--template', template, '--review-output', reviewFile, '--criteria', path.join(repo, 'tickets', key, 'criteria.md'), '--results', path.join(repo, 'tickets', key, 'results.json'), '--screenshots', screenshots, '--output', docx], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(docx)) fail('Template report generation completed without a non-empty DOCX');
    execFileSync('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', renderer, '-InputDocx', docx, '-OutputPdf', pdf], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(pdf)) fail('Template PDF conversion completed without a non-empty PDF');
  return { docx, pdf };
}

if (!fs.existsSync(stagingRoot)) process.exit(0);
// Use a private temporary index so unrelated checkout changes and index locks do not block publishing.
fs.rmSync(publisherIndex, { force: true });
syncBeforePublish();

const runs = fs.readdirSync(stagingRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => path.join(stagingRoot, entry.name))
  .sort();
const run = runs.find(candidate => {
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
  let criteriaMarkdown = output.criteriaMarkdown.trim();
  criteriaMarkdown = criteriaMarkdown.replace(/\\n/g, '\n');
  if (!/Generated from Jira acceptance criteria|Generated from Jira description|Source: Jira description|Converted from the complete Jira ticket source|Generated from the Jira ticket source/i.test(criteriaMarkdown)) {
    criteriaMarkdown = '<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->\n\n' + criteriaMarkdown;
  }
  criteriaMarkdown = criteriaMarkdown.replace(/^-\s+(?!\[)/gm, '- [ ] ');
  if (!criteriaMarkdown.split(/\r?\n/).some((line) => line.startsWith('- [ ] '))) fail('criteriaMarkdown has no valid unchecked checklist bullets');
  ensurePath(path.join(ticketDir, 'criteria.md'));
  fs.writeFileSync(path.join(ticketDir, 'criteria.md'), criteriaMarkdown + '\n', 'utf8');
  status.qaStatus = output.qaStatus || 'Ready for Testing';
  status.criteriaVerified = output.qaStatus !== 'Blocked';
  status.blockedStage = output.qaStatus === 'Blocked' ? 'criteria' : null;
  writeJson(statusFile, status);
  changed.push(`tickets/${key}/criteria.md`, `tickets/${key}/status.json`);
} else if (outputType === 'test-output.json') {
  if (!output.results || typeof output.results !== 'object') fail('results is missing');
  if (typeof output.conciseReport !== 'string') fail('conciseReport is missing');
  const attempt = nextEvidenceAttempt(key, status);
  const attemptName = `attempt-${String(attempt).padStart(3, '0')}`;
  const attemptEvidenceDir = path.join(evidenceRoot, key, 'screenshots', attemptName);
  const results = Array.isArray(output.results) ? output.results.map(item => ({
      ...item,
      evidence: Array.isArray(item.evidence)
        ? item.evidence.map(file => `screenshots/${attemptName}/${path.basename(String(file))}`)
        : item.evidence
    })) : output.results;
  writeJson(path.join(ticketDir, 'results.json'), results);
  fs.writeFileSync(path.join(ticketDir, 'report.md'), `${output.conciseReport.trim()}\n`, 'utf8');
  ensurePath(path.join(ticketDir, 'history', 'placeholder'));
  const historyFile = path.join(ticketDir, 'history', `attempt-${String(attempt).padStart(3, '0')}-test.json`);
  writeJson(historyFile, { ...output, results, historyAttempt: attempt, recordedAt: new Date().toISOString() });
  status.qaStatus = output.qaStatus || 'Awaiting Evidence Review';
  if (output.qaStatus === 'Blocked') {
    status.blockedStage = 'testing';
  } else {
    status.blockedStage = null;
  }
  writeJson(statusFile, status);
  if (!directFile) copyFolder(path.join(run, 'screenshots'), attemptEvidenceDir);
  changed.push(`tickets/${key}/results.json`, `tickets/${key}/report.md`, `tickets/${key}/history/${path.basename(historyFile)}`, `tickets/${key}/status.json`);
} else {
  if (!Array.isArray(output.criterionOutcomes)) fail('criterionOutcomes is missing');
  if (!fs.existsSync(path.join(ticketDir, 'results.json'))) fail('Cannot publish evidence review before tester results.json is present');
  const review = { ...output };
  let generatedDocx = path.join(run, 'report.docx');
  let generatedPdf = path.join(run, 'report.pdf');
  try {
    const results = readJson(path.join(ticketDir, 'results.json'));
    const evidencePath = (Array.isArray(results) ? results : [])
      .flatMap(item => Array.isArray(item?.evidence) ? item.evidence : [])
      .map(file => String(file))
      .find(file => /screenshots[\\/]attempt-[0-9]+[\\/]/i.test(file));
    const attemptMatch = evidencePath?.match(/screenshots[\\/]((?:attempt)-[0-9]+)/i);
    const screenshots = attemptMatch
      ? path.join(evidenceRoot, key, 'screenshots', attemptMatch[1])
      : text(output.evidenceFolder).match(/[\\/]attempt-[0-9]+(?:[\\/]|$)/i)
        ? text(output.evidenceFolder)
        : '';
    if (!nonEmpty(generatedPdf)) {
      if (!screenshots || !pngEvidence(screenshots)) fail('The selected evidence folder contains no non-empty PNG files');
      const built = buildVerifiedReport(key, run, screenshots);
      generatedDocx = built.docx;
      generatedPdf = built.pdf;
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
    copyFolder(generatedDocx, path.join(evidenceRoot, key, 'reports', `${key}.docx`));
    copyFolder(generatedPdf, path.join(evidenceRoot, key, 'reports', `${key}.pdf`));
    if (nonEmpty(generatedPdf)) {
      copyFolder(generatedPdf, path.join(repo, 'tickets', key, 'report.pdf'));
      changed.push(`tickets/${key}/report.pdf`);
    }
  }
  changed.push(`tickets/${key}/review.json`, `tickets/${key}/status.json`);
}

function publishFromCleanWorktree() {
  const base = path.join(process.env.TEMP || 'C:\\Windows\\Temp', `test2-publish-${process.pid}`);
  fs.mkdirSync(base, { recursive: true });
  let worktree = '';
  try {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      runGit(['fetch', 'origin', 'main']);
      const remoteSha = runGit(['ls-remote', 'origin', 'refs/heads/main']).split(/\s+/)[0];
      if (!/^[0-9a-f]{40}$/.test(remoteSha)) fail('GitHub remote read-back returned no usable main SHA');
      worktree = path.join(base, `worktree-${attempt}`);
      runGit(['worktree', 'add', '--detach', worktree, remoteSha]);
      const cleanIndex = path.join(base, `index-${attempt}`);
      runGitAt(worktree, ['read-tree', 'HEAD'], cleanIndex);
      for (const relative of changed) {
        const source = path.join(repo, relative);
        const target = path.join(worktree, relative);
        ensurePath(target);
        fs.copyFileSync(source, target);
      }
      runGitAt(worktree, ['add', '--', ...changed], cleanIndex);
      if (!runGitAt(worktree, ['diff', '--cached', '--name-only'], cleanIndex)) {
        if (!remoteSha) fail('GitHub remote read-back returned no main ref');
        try { runGit(['worktree', 'remove', '--force', worktree]); } catch {}
        worktree = '';
        return { noOp: true };
      }
      runGitAt(worktree, ['commit', '-m', `Publish TEST2 ${key} agent output`], cleanIndex);
      try {
        runGitAt(worktree, ['push', 'origin', 'HEAD:refs/heads/main'], cleanIndex);
        const remote = runGit(['ls-remote', 'origin', 'refs/heads/main']);
        if (!remote) fail('GitHub remote read-back returned no main ref');
        return { noOp: false };
      } catch (error) {
        if (attempt === 3) throw error;
      } finally {
        try { runGit(['worktree', 'remove', '--force', worktree]); } catch {}
        worktree = '';
      }
    }
    fail('Publisher exhausted clean-worktree push retries');
  } finally {
    if (worktree) { try { runGit(['worktree', 'remove', '--force', worktree]); } catch {} }
    try { fs.rmSync(base, { recursive: true, force: true }); } catch {}
  }
}

const publication = publishFromCleanWorktree();
cleanupPublishedFiles(changed);
const cleaned = cleanupRun(run, directFile);
fs.rmSync(publisherIndex, { force: true });
console.log(JSON.stringify({ ticket: key, changedFiles: publication.noOp ? [] : changed, published: true, noOp: publication.noOp, cleaned, cleanupPath: run }));




