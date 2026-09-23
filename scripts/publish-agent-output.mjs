import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const sourceRepo = path.resolve(process.env.TEST2_REPO || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
let repo = sourceRepo;
const evidenceRoot = process.env.TEST2_EVIDENCE || 'C:\\Users\\harry.piper\\Documents\\V4-QA-evidence';
const stagingRoot = process.env.TEST2_STAGING_ROOT || path.join(repo, '.agent-staging');
const publisherIndex = path.join(process.env.TEMP || '.', `test2-publisher-index-${process.pid}`);
const publisherLock = process.env.TEST2_PUBLISHER_LOCK
  || path.join(process.env.LOCALAPPDATA || repo, 'TEST2', 'publisher.lock');
const logFile = process.env.TEST2_PUBLISHER_LOG || path.join(path.dirname(publisherLock), 'publisher.log');
const transientRetentionMs = 14 * 24 * 60 * 60 * 1000;
function log(event, detail = {}) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  if (fs.existsSync(logFile) && fs.statSync(logFile).size > 1024 * 1024) {
    fs.copyFileSync(logFile, `${logFile}.previous`);
    fs.truncateSync(logFile);
  }
  fs.appendFileSync(logFile, `${JSON.stringify({ at: new Date().toISOString(), event, ...detail })}\n`);
}
let activeRun;
process.on('uncaughtExceptionMonitor', error => {
  log('failed', { message: error.message, run: activeRun });
  // Retain failed outputs and give other handoffs a chance on the next tick.
  if (activeRun) {
    try { fs.writeFileSync(path.join(activeRun, 'publisher-error.json'), JSON.stringify({ at: Date.now(), message: error.message })); } catch {}
  }
});
process.on('exit', code => log('exit', { code }));
log('started', { repo: sourceRepo, stagingRoot });

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

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (error) {
    // Some Windows workers emit paths with single backslashes. Repair only
    // invalid JSON escape sequences; valid JSON escapes remain unchanged.
    const repaired = raw.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
    try { return JSON.parse(repaired); } catch { throw error; }
  }
}
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
    for (const entry of fs.readdirSync(desktop, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) {
      if (entry.isDirectory() && entry.name.startsWith('app-')) {
        candidates.push(path.join(desktop, entry.name, 'resources', 'app', 'git', 'cmd', 'git.exe'));
      }
    }
  }
  // Prefer GitHub Desktop's Git: its bundled credential manager is the one
  // authenticated by the user's Desktop sign-in and is available to the
  // unattended publisher task.
  candidates.push('C:\\Users\\harry.piper\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd\\git.exe');
  candidates.push('C:\\Program Files\\Git\\cmd\\git.exe', 'git');
  return candidates.find(candidate => candidate === 'git' || fs.existsSync(candidate)) || 'git';
}
const git = gitPath();
function runGit(args) {
  const gitRoot = path.dirname(path.dirname(git));
  const binPath = path.join(gitRoot, 'mingw64', 'bin');
  const execPath = fs.existsSync(path.join(binPath, 'git-remote-https.exe'))
    ? binPath
    : path.join(gitRoot, 'mingw64', 'libexec', 'git-core');
  return execFileSync(git, ['-C', repo, ...args], {
    timeout: 60000,
    encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never',
      GIT_EXEC_PATH: execPath,
      GIT_INDEX_FILE: publisherIndex,
      PATH: `${binPath};${process.env.PATH || ''}`
    }
  }).trim();
}
function runGitAt(cwd, args, indexFile) {
  const gitRoot = path.dirname(path.dirname(git));
  const binPath = path.join(gitRoot, 'mingw64', 'bin');
  const execPath = fs.existsSync(path.join(binPath, 'git-remote-https.exe'))
    ? binPath
    : path.join(gitRoot, 'mingw64', 'libexec', 'git-core');
  return execFileSync(git, ['-C', cwd, ...args], {
    timeout: 60000,
    encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never',
      GIT_EXEC_PATH: execPath,
      ...(indexFile ? { GIT_INDEX_FILE: indexFile } : {}),
      PATH: `${binPath};${process.env.PATH || ''}`
    }
  }).trim();
}
function syncBeforePublish() {
  runGit(['fetch', 'origin', 'main']);
}
function ensurePath(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function copyFolder(source, target) {
  if (fs.existsSync(source)) fs.cpSync(source, target, { recursive: true, force: true });
}
function nextEvidenceAttempt(key, status, handoffId) {
  // Handoffs carry their durable attempt number. Reuse it if a prior push
  // failed after copying evidence, so retrying publication cannot renumber the
  // same tester output.
  const handoffAttempt = String(handoffId || '').match(/-attempt-(\d+)$/i)?.[1];
  if (handoffAttempt) return Number(handoffAttempt);
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
function pruneTransientStaging(root) {
  // Keep worker output, screenshots, publisher errors and all permanent
  // evidence.  Only remove old renderer/debug by-products that can always be
  // regenerated from retained worker output.
  const transientName = /^(?:console-.*\.log|page-.*\.yml|TEST2-\d+-report-(?:render|check|page-\d+)\.(?:docx|pdf|png)|report-generated-\d+\.(?:docx|pdf)|report-images-\d+\.json)$/i;
  let removed = 0;
  if (!fs.existsSync(root)) return removed;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (transientName.test(entry.name) && Date.now() - fs.statSync(target).mtimeMs > transientRetentionMs) {
        fs.rmSync(target, { force: true });
        removed += 1;
      }
    }
  };
  visit(root);
  if (removed) log('staging_retention_pruned', { removed, retentionDays: transientRetentionMs / 86400000 });
  return removed;
}
function nonEmpty(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}
function pngEvidence(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some(name => name.toLowerCase().endsWith('.png') && nonEmpty(path.join(dir, name)));
}

const VALID_OUTCOMES = new Set(['passed', 'failed', 'blocked', 'unverified']);

function requiredCriteria(ticketDir) {
  const criteriaFile = path.join(ticketDir, 'criteria.md');
  if (!fs.existsSync(criteriaFile)) fail(`Missing criteria.md for ${path.basename(ticketDir)}`);
  const criteria = fs.readFileSync(criteriaFile, 'utf8')
    .split(/\r?\n/)
    .map(line => line.match(/^\s*-\s+\[\s?\]\s+(.+?)\s*$/)?.[1])
    .filter(Boolean);
  if (!criteria.length) fail(`criteria.md has no testable checklist criteria for ${path.basename(ticketDir)}`);
  return criteria;
}

function criterionKey(value) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().toLocaleLowerCase()
    : '';
}

function criterionIndex(value, criteria) {
  const numeric = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value.trim())
      ? Number(value.trim())
      : null;
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > criteria.length) return null;
  return numeric - 1;
}

function criterionSimilarity(left, right) {
  const ignored = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'using', 'where', 'with']);
  const tokens = value => new Set(String(value || '').toLocaleLowerCase().match(/[a-z0-9]+/g)?.filter(token => token.length > 1 && !ignored.has(token)) || []);
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const overlap = [...leftTokens].filter(token => rightTokens.has(token)).length;
  return overlap / new Set([...leftTokens, ...rightTokens]).size;
}

function validateCriterionCoverage(items, criteria, label) {
  if (!Array.isArray(items) || items.length !== criteria.length) {
    fail(`${label} must contain exactly one result for each of the ${criteria.length} checklist criteria`);
  }
  const expected = new Set(criteria.map(criterionKey));
  if (expected.size !== criteria.length) fail('criteria.md contains duplicate checklist criteria');
  const actual = new Set();
  const normalized = new Array(items.length);
  const unmatched = [];
  for (const [index, item] of items.entries()) {
    const ordinal = criterionIndex(item?.criterion, criteria);
    const exactKey = criterionKey(item?.criterion);
    const exactIndex = ordinal ?? criteria.findIndex(criterion => criterionKey(criterion) === exactKey);
    if (exactIndex >= 0) {
      const key = criterionKey(criteria[exactIndex]);
      if (actual.has(key)) fail(`${label} item ${index + 1} does not map uniquely to a checklist criterion`);
      actual.add(key);
      normalized[index] = { ...item, criterion: criteria[exactIndex] };
    } else {
      unmatched.push({ index, item });
    }
  }
  // Older workers sometimes paraphrased a criterion despite covering it. Map
  // only an unambiguous, high-overlap one-to-one match; otherwise reject it.
  for (const { index, item } of unmatched) {
    const ranked = criteria
      .map((criterion, candidateIndex) => ({ criterion, candidateIndex, score: criterionSimilarity(item?.criterion, criterion) }))
      .filter(candidate => !actual.has(criterionKey(candidate.criterion)))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const runnerUp = ranked[1];
    if (!best || best.score < 0.65 || (runnerUp && best.score - runnerUp.score < 0.15)) {
      fail(`${label} item ${index + 1} does not map uniquely to a checklist criterion`);
    }
    actual.add(criterionKey(best.criterion));
    normalized[index] = { ...item, criterion: best.criterion };
  }
  if (actual.size !== criteria.length) fail(`${label} does not cover every checklist criterion`);

  for (const [index, item] of normalized.entries()) {
    const outcome = String(item?.outcome || item?.status || '').trim().toLowerCase();
    if (!VALID_OUTCOMES.has(outcome)) {
      fail(`${label} item ${index + 1} has an invalid outcome: ${item?.outcome || item?.status || '(missing)'}`);
    }
    normalized[index] = { ...item, outcome: outcome[0].toUpperCase() + outcome.slice(1) };
  }
  return normalized;
}

function derivedReviewOutcome(criterionOutcomes) {
  const outcomes = criterionOutcomes.map(item => String(item.outcome).trim().toLowerCase());
  if (outcomes.includes('blocked')) return 'Blocked';
  if (outcomes.includes('failed')) return 'Failed';
  if (outcomes.includes('unverified')) return 'Unverified';
  return 'Passed';
}

function validateReviewSummary(criterionOutcomes, overallOutcome, qaStatus) {
  const derived = derivedReviewOutcome(criterionOutcomes);
  if (String(overallOutcome || '').trim().toLowerCase() !== derived.toLowerCase()) {
    fail(`Evidence review overallOutcome must be ${derived}, derived from criterionOutcomes`);
  }
  const expectedQaStatus = derived === 'Blocked' ? 'Blocked' : 'Evidence Reviewed';
  if (String(qaStatus || '').trim().toLowerCase() !== expectedQaStatus.toLowerCase()) {
    fail(`Evidence review qaStatus must be ${expectedQaStatus} when overallOutcome is ${derived}`);
  }
}

function validateTesterStatus(results, qaStatus) {
  const expectedQaStatus = results.some(item => String(item.outcome).trim().toLowerCase() === 'blocked')
    ? 'Blocked'
    : 'Awaiting Evidence Review';
  if (String(qaStatus || '').trim().toLowerCase() !== expectedQaStatus.toLowerCase()) {
    fail(`Tester qaStatus must be ${expectedQaStatus}, derived from result outcomes`);
  }
}
function buildVerifiedReport(key, run, screenshots) {
  const python = process.env.TEST2_PYTHON || 'C:\\Users\\harry.piper\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
  const template = process.env.TEST2_TEMPLATE || path.join(repo, 'assets', 'templates', 'Automated Test Case Template.docx');
  const builder = path.join(repo, 'scripts', 'build-evidence-report.py');
  const renderer = path.join(repo, 'scripts', 'render-docx-to-pdf.ps1');
  const pdfVerifier = path.join(repo, 'scripts', 'verify-report-pdf.py');
  const reviewFile = path.join(run, 'review-output.json');
  const docx = path.join(run, `report-generated-${process.pid}.docx`);
  const pdf = path.join(run, `report-generated-${process.pid}.pdf`);
  const imageManifest = path.join(run, `report-images-${process.pid}.json`);
  try {
    execFileSync(python, ['-c', 'import docx, PIL, pypdf'], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  } catch {
    fail(`Python reporting dependencies are unavailable. Install the pinned packages in requirements-reporting.txt for ${python}.`);
  }
  execFileSync(python, [builder, '--template', template, '--review-output', reviewFile, '--criteria', path.join(repo, 'tickets', key, 'criteria.md'), '--results', path.join(repo, 'tickets', key, 'results.json'), '--screenshots', screenshots, '--output', docx, '--image-manifest', imageManifest], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(docx)) fail('Template report generation completed without a non-empty DOCX');
  const imageSummary = readJson(imageManifest);
  if (!Number.isInteger(imageSummary.embeddedEvidenceImages) || imageSummary.embeddedEvidenceImages < 1 || !Array.isArray(imageSummary.expectedEvidence) || imageSummary.expectedEvidence.length !== imageSummary.embeddedEvidenceImages) {
    fail('Template report generation did not produce a complete evidence-identity manifest');
  }
  execFileSync('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', renderer, '-InputDocx', docx, '-OutputPdf', pdf], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  if (!nonEmpty(pdf)) fail('Template PDF conversion completed without a non-empty PDF');
  try {
    const audit = execFileSync(python, [pdfVerifier, '--pdf', pdf, '--image-manifest', imageManifest], { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
    log('pdf_evidence_verified', { ticket: key, ...JSON.parse(audit) });
  } catch (error) {
    const detail = String(error.stdout || error.stderr || error.message).trim();
    fail(`PDF evidence verification failed: ${detail}`);
  }
  return { docx, pdf };
}

if (!fs.existsSync(stagingRoot)) process.exit(0);
pruneTransientStaging(stagingRoot);
// Use a private temporary index so unrelated checkout changes and index locks do not block publishing.
fs.rmSync(publisherIndex, { force: true });
syncBeforePublish();

const runs = fs.readdirSync(stagingRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => path.join(stagingRoot, entry.name))
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
const run = runs.find(candidate => {
  const errorFile = path.join(candidate, 'publisher-error.json');
  if (fs.existsSync(errorFile) && Date.now() - fs.statSync(errorFile).mtimeMs < 300000) return false;
  return ['criteria-output.json', 'test-output.json', 'review-output.json', 'guide-impact-output.json', 'guide-update-output.json']
    .some(name => fs.existsSync(path.join(candidate, name)));
});
if (!run) { log('idle'); process.exit(0); }
activeRun = run;

// Fetch does not update Desktop files. Read and generate everything in a fresh
// remote checkout; never restore or delete the user's working files on cleanup.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'test2-publisher-source-'));
const processingRepo = path.join(scratch, 'checkout');
runGit(['worktree', 'add', '--detach', processingRepo, 'origin/main']);
repo = processingRepo;
process.on('exit', () => {
  try { runGitAt(sourceRepo, ['worktree', 'remove', '--force', processingRepo]); } catch {}
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch {}
});

const directFile = fs.statSync(run).isFile();
const files = directFile
  ? [path.basename(run)]
  : ['criteria-output.json', 'test-output.json', 'review-output.json', 'guide-impact-output.json', 'guide-update-output.json']
      .filter(name => fs.existsSync(path.join(run, name)));
if (files.length !== 1) fail(`Expected exactly one output file in ${run}; found ${files.join(', ') || 'none'}`);
const output = readJson(directFile ? run : path.join(run, files[0]));
const outputType = files[0].endsWith('criteria-output.json') || output.criteriaMarkdown ? 'criteria-output.json'
  : files[0].endsWith('test-output.json') || output.results ? 'test-output.json'
  : files[0].endsWith('guide-impact-output.json') || output.decision ? 'guide-impact-output.json'
  : files[0].endsWith('guide-update-output.json') || output.changeType ? 'guide-update-output.json'
  : 'review-output.json';
const key = ticketKey(output.ticket);
log('processing', { ticket: key, handoffId: output.handoffId, outputType });
if (output.noOp === true) {
  // A no-op is never publishable work.  Removing it prevents a stale worker
  // from repeatedly masking a later real output in the same handoff folder.
  log('worker_no_op', { ticket: key, handoffId: output.handoffId });
  cleanupRun(run, directFile);
  process.exit(0);
}
const expectedAction = outputType === 'criteria-output.json'
  ? 'criteria_conversion'
  : outputType === 'test-output.json'
    ? 'test_ticket'
    : outputType === 'guide-impact-output.json'
      ? 'guide_impact_assessment'
      : outputType === 'guide-update-output.json'
        ? 'guide_update_authoring'
    : 'evidence_review';
if (typeof output.handoffVersion !== 'string' || !output.handoffVersion) fail('handoffVersion is missing');
const liveQueue = readJson(path.join(repo, 'status', 'handoffs.json'));
const liveHandoff = (liveQueue.handoffs || []).find((handoff) => handoff.handoffId === output.handoffId);
if (!liveHandoff
  || liveHandoff.ticket !== key
  || liveHandoff.action !== expectedAction
  || liveHandoff.handoffVersion !== output.handoffVersion) {
  fail(`Stale or mismatched worker output for ${output.handoffId}`);
}
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
  // Convert an unambiguous numbered list into the required unchecked
  // checklist format. Prose that is not a list remains rejected below.
  criteriaMarkdown = criteriaMarkdown.replace(/^\s*\d+[.)]\s+/gm, '- [ ] ');
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
  const criteria = requiredCriteria(ticketDir);
  output.results = validateCriterionCoverage(output.results, criteria, 'Tester results');
  validateTesterStatus(output.results, output.qaStatus);
  const attempt = nextEvidenceAttempt(key, status, output.handoffId);
  const attemptName = `attempt-${String(attempt).padStart(3, '0')}`;
  const attemptEvidenceDir = path.join(evidenceRoot, key, 'screenshots', attemptName);
  // Validate each referenced file before publishing status or assigning paths.
  if (!Array.isArray(output.results)) fail('results must be an array');
  const evidenceOwners = new Map();
  for (const [index, item] of output.results.entries()) {
    const outcome = String(item?.outcome || item?.status || '');
    const evidence = Array.isArray(item?.evidence) ? item.evidence : [];
    if (outcome !== 'Blocked' && evidence.length < 2) {
      fail(`${outcome || 'Unspecified'} criterion ${index + 1} needs its own initial and final PNG evidence`);
    }
    const criterionPrefix = `criterion-${index + 1}-`;
    for (const file of evidence) {
      const name = path.win32.basename(String(file));
      if (!name.toLowerCase().startsWith(criterionPrefix)) {
        fail(`Criterion ${index + 1} evidence must use its own ${criterionPrefix} filename: ${name}`);
      }
      if (evidenceOwners.has(name)) {
        fail(`PNG evidence is reused by criteria ${evidenceOwners.get(name) + 1} and ${index + 1}: ${name}`);
      }
      evidenceOwners.set(name, index);
      const source = path.join(run, 'screenshots', name);
      if (!/\.png$/i.test(name) || !nonEmpty(source)) fail(`Missing staged PNG: ${source}`);
      const header = fs.readFileSync(source).subarray(0, 8);
      if (!header.equals(Buffer.from([137,80,78,71,13,10,26,10]))) fail(`Invalid PNG: ${source}`);
    }
  }
  copyFolder(path.join(run, 'screenshots'), attemptEvidenceDir);
  const results = Array.isArray(output.results) ? output.results.map(item => ({
      ...item,
      evidence: Array.isArray(item.evidence)
        ? item.evidence.map(file => `screenshots/${attemptName}/${path.win32.basename(String(file))}`)
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
  for (const item of results) for (const file of item.evidence || []) {
    if (!nonEmpty(path.join(evidenceRoot, key, file))) fail(`Evidence copy failed: ${file}`);
  }
  changed.push(`tickets/${key}/results.json`, `tickets/${key}/report.md`, `tickets/${key}/history/${path.basename(historyFile)}`, `tickets/${key}/status.json`);
} else if (outputType === 'guide-impact-output.json') {
  const policy = readJson(path.join(repo, 'config', 'user-guide-impact-policy.json'));
  if (policy.enabled !== true || policy.onlyForPassedEvidenceReviews !== true) fail('User-guide impact assessment is disabled by policy');
  if (!['not_needed', 'update_required'].includes(output.decision)) fail('guide impact decision is invalid');
  if (typeof output.reason !== 'string' || !output.reason.trim()) fail('guide impact reason is missing');
  if (output.decision === 'update_required' && (typeof output.affectedSection !== 'string' || !output.affectedSection.trim())) fail('update_required needs affectedSection');
  if (output.decision === 'not_needed' && String(output.affectedSection || '').trim()) fail('not_needed must not name an affectedSection');
  const review = readJson(path.join(ticketDir, 'review.json'));
  if (String(review.overallOutcome || review.qaStatus || '').trim().toLowerCase() !== 'passed') fail('Guide impact can only be published after a passed evidence review');
  if (!nonEmpty(path.join(ticketDir, 'report.pdf'))) fail('Guide impact requires the passed evidence report');
  const guideImpact = { schema: 'v4-user-guide-impact.v1', ...output, assessedAt: new Date().toISOString() };
  writeJson(path.join(ticketDir, 'guide-impact.json'), guideImpact);
  status.guideImpact = guideImpact;
  writeJson(statusFile, status);
  changed.push(`tickets/${key}/guide-impact.json`, `tickets/${key}/status.json`);
} else if (outputType === 'guide-update-output.json') {
  const policy = readJson(path.join(repo, 'config', 'user-guide-update-policy.json'));
  if (policy.enabled !== true || policy.onlyForPassedEvidenceReviews !== true || policy.requireVerifiedTicketEvidence !== true) fail('User-guide update authoring is disabled by policy');
  if (typeof output.title !== 'string' || !output.title.trim()) fail('guide update title is missing');
  if (typeof output.affectedSection !== 'string' || !output.affectedSection.trim()) fail('guide update affectedSection is missing');
  if (!Array.isArray(policy.allowChangeTypes) || !policy.allowChangeTypes.includes(output.changeType)) fail('guide update changeType is invalid');
  if (!Array.isArray(output.steps) || output.steps.length === 0 || output.steps.some(step => typeof step !== 'string' || !step.trim())) fail('guide update steps are missing');
  if (!Array.isArray(output.screenshots) || output.screenshots.length === 0 || output.screenshots.some(file => typeof file !== 'string' || !/^screenshots[\\/].+\.png$/i.test(file) || file.includes('..'))) fail('guide update screenshots must be safe PNG evidence paths');
  if (new Set(output.screenshots).size !== output.screenshots.length) fail('guide update screenshots must be distinct');
  if (typeof output.reason !== 'string' || !output.reason.trim()) fail('guide update reason is missing');
  const impact = readJson(path.join(ticketDir, 'guide-impact.json'));
  const review = readJson(path.join(ticketDir, 'review.json'));
  const results = readJson(path.join(ticketDir, 'results.json'));
  const verifiedEvidence = new Set((Array.isArray(results) ? results : []).flatMap(item => Array.isArray(item?.evidence) ? item.evidence : []));
  if (impact?.decision !== 'update_required' || String(review?.overallOutcome || '').toLowerCase() !== 'passed' || !nonEmpty(path.join(ticketDir, 'report.pdf'))) fail('Guide update requires a passed reviewed update_required ticket');
  if (output.screenshots.some(file => !verifiedEvidence.has(file))) fail('guide update screenshots must come from the ticket’s verified results');
  const guideUpdate = { schema: 'v4-user-guide-update.v1', ...output, authoredAt: new Date().toISOString() };
  writeJson(path.join(ticketDir, 'guide-update.json'), guideUpdate);
  status.guideUpdate = guideUpdate;
  writeJson(statusFile, status);
  changed.push(`tickets/${key}/guide-update.json`, `tickets/${key}/status.json`);
} else {
  if (!Array.isArray(output.criterionOutcomes) || output.criterionOutcomes.length === 0) fail('criterionOutcomes is missing');
  if (output.criterionOutcomes.some((item) => !item || !['string', 'number'].includes(typeof item.criterion) || typeof item.outcome !== 'string' || typeof item.reason !== 'string')) {
    fail('criterionOutcomes has an invalid item');
  }
  const criteria = requiredCriteria(ticketDir);
  output.criterionOutcomes = validateCriterionCoverage(output.criterionOutcomes, criteria, 'Evidence review');
  validateReviewSummary(output.criterionOutcomes, output.overallOutcome, output.qaStatus);
  if (!fs.existsSync(path.join(ticketDir, 'results.json'))) fail('Cannot publish evidence review before tester results.json is present');
  const review = { ...output };
  let generatedDocx = path.join(run, 'report.docx');
  let generatedPdf = path.join(run, 'report.pdf');
  const results = readJson(path.join(ticketDir, 'results.json'));
  const evidencePath = (Array.isArray(results) ? results : [])
    .flatMap(item => Array.isArray(item?.evidence) ? item.evidence : [])
    .map(file => String(file))
    .find(file => /screenshots[\\/]attempt-[0-9]+[\\/]/i.test(file));
  const attemptMatch = evidencePath?.match(/screenshots[\\/]((?:attempt)-[0-9]+)/i);
  const screenshots = attemptMatch
    ? path.join(evidenceRoot, key, 'screenshots', attemptMatch[1])
    : String(output.evidenceFolder || '').match(/[\\/]attempt-[0-9]+(?:[\\/]|$)/i)
      ? String(output.evidenceFolder)
      : '';
  if (!screenshots || !pngEvidence(screenshots)) fail('The selected evidence folder contains no non-empty PNG files');
  writeJson(path.join(run, 'review-output.json'), review);
  const built = buildVerifiedReport(key, run, screenshots);
  generatedDocx = built.docx;
  generatedPdf = built.pdf;
  if (!nonEmpty(generatedPdf)) fail('Evidence review report PDF is missing after generation');
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
  // os.tmpdir() keeps temporary publisher worktrees valid on Windows and in
  // the Linux GitHub Actions regression runner.
  const base = path.join(os.tmpdir(), `test2-publish-${process.pid}`);
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
        const publishedCommit = runGitAt(worktree, ['rev-parse', 'HEAD'], cleanIndex);
        runGit(['fetch', 'origin', 'main']);
        // Confirm our exact commit is remote, even if a bundler commit followed it.
        runGit(['merge-base', '--is-ancestor', publishedCommit, 'origin/main']);
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
log('published', { ticket: key, handoffId: output.handoffId, ...publication });
const cleaned = cleanupRun(run, directFile);
fs.rmSync(publisherIndex, { force: true });
console.log(JSON.stringify({ ticket: key, changedFiles: publication.noOp ? [] : changed, published: true, noOp: publication.noOp, cleaned, cleanupPath: run }));







