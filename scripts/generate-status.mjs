import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { acceptanceCriteria, flattenAdf } from './jira-adf.mjs';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const ticketsDir = path.join(root, 'tickets');
const outDir = path.join(root, 'status');
const generatedDir = path.join(outDir, 'generated');
const guideImpactPolicyPath = path.join(root, 'config', 'user-guide-impact-policy.json');
const guideUpdatePolicyPath = path.join(root, 'config', 'user-guide-update-policy.json');

const STATUS_LABELS = new Map([
  ['published', 'Published'],
  ['approved', 'Approved'],
  ['in review', 'In Review'],
  ['assessed', 'Assessed'],
  ['executed', 'Executed'],
  ['leased', 'Leased'],
  ['retry queued', 'Retry Queued'],
  ['blocked', 'Blocked'],
  ['ready for testing', 'Ready'],
  ['ready', 'Ready'],
  ['intake', 'Intake'],
  ['imported', 'Imported']
]);

const STATUS_PRIORITY = [
  'Published',
  'Approved',
  'In Review',
  'Assessed',
  'Executed',
  'Leased',
  'Retry Queued',
  'Blocked',
  'Ready',
  'Intake',
  'Imported'
];

const REQUIRED_JSON = Symbol('required-json');

function readJson(file, fallback = REQUIRED_JSON) {
  if (!fs.existsSync(file)) {
    if (fallback !== REQUIRED_JSON) return fallback;
    throw new Error(`${file}: file not found`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}

function writeJson(file, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  if (checkOnly) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) {
      throw new Error(`${path.relative(root, file)} is not up to date; run npm run generate`);
    }
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

function writeText(file, value) {
  const body = value.endsWith('\n') ? value : `${value}\n`;
  if (checkOnly) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) {
      throw new Error(`${path.relative(root, file)} is not up to date; run npm run generate`);
    }
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

function canonicalState(value, fallback = 'Imported') {
  const key = String(value || '').trim().toLowerCase();
  return STATUS_LABELS.get(key) || value || fallback;
}

function statusRank(state) {
  const i = STATUS_PRIORITY.indexOf(canonicalState(state));
  return i === -1 ? STATUS_PRIORITY.length : i;
}

function aggregateResultOutcome(results) {
  const values = Array.isArray(results)
    ? results.map((item) => item?.outcome).filter(Boolean)
    : [results?.overallOutcome].filter(Boolean);
  const normalized = values.map((value) => String(value).trim().toLowerCase());
  if (normalized.includes('blocked')) return 'Blocked';
  if (normalized.includes('failed')) return 'Failed';
  if (normalized.includes('unverified')) return 'Unverified';
  if (normalized.length > 0 && normalized.every((value) => value === 'passed')) return 'Passed';
  return null;
}

function artifactOutcome(dir, localStatus) {
  const review = readJson(path.join(dir, 'review.json'), null);
  const results = readJson(path.join(dir, 'results.json'), null);
  const attempts = fs.existsSync(path.join(dir, 'history'))
    ? fs.readdirSync(path.join(dir, 'history')).filter((name) => /^attempt-\d+-test\.json$/i.test(name)).sort()
    : [];
  const latestAttempt = attempts.length ? readJson(path.join(dir, 'history', attempts.at(-1)), null) : null;
  const latestNumber = Number(latestAttempt?.historyAttempt || attempts.at(-1)?.match(/attempt-(\d+)-test/i)?.[1] || 0);
  const reviewNumber = Number(review?.historyAttempt || review?.evidenceFolder?.match(/attempt-(\d+)/i)?.[1] || 0);
  // Any newer tester history supersedes an older review, including a review
  // blocked only because its report/PDF could not be generated.
  const reviewIsStale = latestNumber > reviewNumber;
  const reviewOutcome = review?.overallOutcome || null;
  const resultsOutcome = aggregateResultOutcome(results);
  if (!reviewIsStale && localStatus.qaStatus === 'Evidence Reviewed' && reviewOutcome) return reviewOutcome;
  if (resultsOutcome) return resultsOutcome;
  if (!reviewIsStale && reviewOutcome) return reviewOutcome;
  if (latestAttempt?.results) return aggregateResultOutcome(latestAttempt.results);
  return localStatus.qaOutcome || null;
}

function passedEvidenceReview(dir, review, latestAttempt, reviewNumber, latestNumber) {
  return Boolean(
    review?.noOp !== true
    && latestAttempt
    && reviewNumber >= latestNumber
    && fs.existsSync(path.join(dir, 'report.pdf'))
    && fs.statSync(path.join(dir, 'report.pdf')).size > 0
    && String(review.overallOutcome || review.qaStatus || '').trim().toLowerCase() === 'passed'
  );
}

function mergeStatus(ticket, localStatus) {
  const jiraState = canonicalState(ticket.jira.status, 'Imported');
  const localState = canonicalState(localStatus.workflowState || localStatus.status, 'Imported');
  const workflowState = statusRank(localState) <= statusRank(jiraState) ? localState : jiraState;
  const retries = Number(localStatus.retries || 0);
  const retryLimit = Number(localStatus.retryLimit || 3);
  const qaStatus = localStatus.criteriaVerified !== true
    ? 'Criteria Check Required'
    : localStatus.qaStatus && localStatus.qaStatus !== 'Not Tested'
      ? localStatus.qaStatus
      : (criteriaReady(ticket) ? 'Ready for Testing' : (ticket.acceptanceCriteria.length ? 'Ready for Testing' : 'Criteria Review Required'));
  const jiraReady = jiraReadyForTesting(ticket);
  const jiraGateBlocked = !jiraReady && ['Ready for Testing', 'Awaiting Evidence Review', 'Blocked'].includes(qaStatus);
  const projectedWorkflowState = jiraGateBlocked ? 'Blocked' : workflowState;
  const retryExhausted = retries >= retryLimit && ['blocked', 'failed', 'unverified'].includes(String(localStatus.qaOutcome || localStatus.outcome || '').trim().toLowerCase());
  const finalReviewPending = qaStatus === 'Awaiting Evidence Review' && localStatus.blockedStage === 'evidence_review';
  const nextAction = finalReviewPending
    ? 'Create final evidence review handoff'
    : retryExhausted
    ? 'Manual review required after retry limit'
    : qaStatus === 'Evidence Reviewed'
    ? 'QA review complete'
    : (qaStatus === 'Criteria Check Required' || qaStatus === 'Criteria Review Required')
      ? 'Create criteria conversion handoff'
      : projectedWorkflowState === 'Retry Queued'
      ? (jiraReady ? `Retry ${retries}/${retryLimit} queued; coordinator will start tester` : 'Waiting for Jira status: READY FOR TESTING')
      : jiraGateBlocked
        ? 'Waiting for Jira status: READY FOR TESTING'
      : projectedWorkflowState === 'Blocked' && retries >= retryLimit
        ? 'Manual review required after retry limit'
        : !jiraReady && (qaStatus === 'Ready for Testing' || qaStatus === 'Awaiting Evidence Review')
          ? 'Waiting for Jira status: READY FOR TESTING'
          : localStatus.nextAction || defaultNextAction(workflowState, criteriaReady(ticket));
  return {
    jiraStatus: ticket.jira.status || 'Unknown',
    workflowState: projectedWorkflowState,
    qaStatus,
    qaOutcome: localStatus.qaOutcome || localStatus.outcome || 'Not Tested',
    automationSuitability: localStatus.automationSuitability || 'Unclassified',
    actionOwner: localStatus.actionOwner || 'Coordinator',
    nextAction,
    reviewState: localStatus.reviewState || 'Not Reviewed',
    guideImpact: localStatus.guideImpact || null,
    guideUpdate: localStatus.guideUpdate || null,
    retries,
    blockedStage: localStatus.blockedStage || null,
    updatedAt: localStatus.updatedAt || ticket.jira.updated || ticket.source.importedAt || null,
    criteriaVerified: localStatus.criteriaVerified === true
  };
}

function defaultNextAction(workflowState, hasCriteria = false) {
  if (workflowState === 'Blocked') return 'Hold until dependency changes';
  if (workflowState === 'Retry Queued') return 'Create retry handoff';
  if (workflowState === 'Ready') return hasCriteria ? 'Create testing handoff' : 'Create criteria conversion handoff';
  if (workflowState === 'Imported') return 'Classify ticket for workflow routing';
  return 'No deterministic action available';
}

function normalizeTicket(dirName) {
  const dir = path.join(ticketsDir, dirName);
  const raw = readJson(path.join(dir, 'ticket.json'));
  const fields = raw.fields || {};
  const descriptionText = flattenAdf(fields.description).replace(/\n{3,}/g, '\n\n').trim();
  const subtasks = (fields.subtasks || []).map((s) => ({
    key: s.key,
    summary: s.fields?.summary || '',
    status: s.fields?.status?.name || ''
  }));
  const ticket = {
    key: raw.key || dirName,
    id: raw.id || null,
    summary: fields.summary || dirName,
    jira: {
      url: `https://metricell.atlassian.net/browse/${raw.key || dirName}`,
      status: fields.status?.name || null,
      priority: fields.priority?.name || null,
      assignee: fields.assignee?.displayName || null,
      project: fields.project?.key || null,
      parent: fields.parent?.key || null,
      created: fields.created || null,
      updated: fields.updated || null
    },
    description: descriptionText,
    acceptanceCriteria: acceptanceCriteria(descriptionText),
    files: {
      ticket: `tickets/${raw.key || dirName}/ticket.json`,
      criteria: `tickets/${raw.key || dirName}/criteria.md`,
      status: `tickets/${raw.key || dirName}/status.json`,
      screenshots: `tickets/${raw.key || dirName}/screenshots/`,
      reports: `tickets/${raw.key || dirName}/reports/`
    },
    subtasks,
    source: {
      importedFrom: raw.self || null,
      importedAt: fields.updated || fields.created || null
    }
  };
  const statusPath = path.join(dir, 'status.json');
  let localStatus = readJson(statusPath, {
    ticket: ticket.key,
    jiraStatus: ticket.jira.status || 'Unknown',
    qaStatus: 'Not Tested',
    status: ticket.jira.status || 'Unknown',
    retries: 0,
    retryLimit: 3
  });
  if (!fs.existsSync(statusPath) && !checkOnly) writeJson(statusPath, localStatus);
  // ticket.json is the authoritative imported Jira snapshot. Keep the small
  // Jira mirror in status.json synchronised while preserving QA-owned fields.
  const importedJiraStatus = ticket.jira.status || 'Unknown';
  if (localStatus.jiraStatus !== importedJiraStatus || localStatus.status !== importedJiraStatus) {
    localStatus = { ...localStatus, jiraStatus: importedJiraStatus, status: importedJiraStatus };
    if (!checkOnly) fs.writeFileSync(statusPath, JSON.stringify(localStatus, null, 2) + '\n', 'utf8');
  }
  const derivedOutcome = artifactOutcome(dir, localStatus);
  if (derivedOutcome) localStatus = { ...localStatus, qaOutcome: derivedOutcome };
  const review = readJson(path.join(dir, 'review.json'), null);
  const guideImpact = readJson(path.join(dir, 'guide-impact.json'), null);
  if (guideImpact?.decision) localStatus = { ...localStatus, guideImpact };
  const guideUpdate = readJson(path.join(dir, 'guide-update.json'), null);
  if (guideUpdate?.title) localStatus = { ...localStatus, guideUpdate };
  const attempts = fs.existsSync(path.join(dir, 'history'))
    ? fs.readdirSync(path.join(dir, 'history')).filter((name) => /^attempt-\d+-test\.json$/i.test(name)).sort()
    : [];
  const latestAttempt = attempts.length ? readJson(path.join(dir, 'history', attempts.at(-1)), null) : null;
  const latestNumber = Number(latestAttempt?.historyAttempt || attempts.at(-1)?.match(/attempt-(\d+)-test/i)?.[1] || 0);
  const reviewNumber = Number(review?.historyAttempt || review?.evidenceFolder?.match(/attempt-(\d+)/i)?.[1] || 0);
  // A newer published test supersedes an older review.  A blocked final
  // attempt still needs evidence review so the user receives a report.
  if (latestAttempt && latestNumber > reviewNumber) {
    const exhausted = Number(localStatus.retries || 0) >= Number(localStatus.retryLimit || 3);
    const needsFinalReview = exhausted;
    localStatus = {
      ...localStatus,
      qaStatus: needsFinalReview ? 'Awaiting Evidence Review' : (latestAttempt.qaStatus || 'Awaiting Evidence Review'),
      workflowState: ticket.jira.status || localStatus.workflowState,
      blockedStage: needsFinalReview ? 'evidence_review' : null,
      nextAction: needsFinalReview ? 'Create final evidence review handoff' : 'Create evidence review handoff'
    };
    if (!checkOnly) fs.writeFileSync(statusPath, JSON.stringify(localStatus, null, 2) + '\n', 'utf8');
  }
  // A published review is the authoritative completion signal for the review
  // stage. Reconcile stale publisher/bundler status before generating handoffs.
  const reviewHasReport = review?.noOp !== true
    && reviewNumber >= latestNumber
    && fs.existsSync(path.join(dir, 'report.pdf'))
    && fs.statSync(path.join(dir, 'report.pdf')).size > 0;
  if (reviewHasReport) {
    const reviewBlocked = ['blocked', 'failed'].includes(String(review.overallOutcome || review.qaStatus || '').trim().toLowerCase());
    localStatus = {
      ...localStatus,
      qaStatus: reviewBlocked ? 'Blocked' : 'Evidence Reviewed',
      workflowState: reviewBlocked ? 'Blocked' : (ticket.jira.status || localStatus.workflowState),
      blockedStage: reviewBlocked ? 'reviewed' : null,
      nextAction: reviewBlocked ? 'Manual review required; final evidence report published' : 'QA review complete'
    };
    if (!checkOnly) fs.writeFileSync(statusPath, JSON.stringify(localStatus, null, 2) + '\n', 'utf8');
  }
  // Any pipeline block is an operational retry signal. Convert it once per block
  // into a retryable state and persist the counter in the ticket status file.
  // This prevents repeated bundler runs from consuming all retries.
  const recordedAttempts = fs.existsSync(path.join(dir, 'history'))
    ? fs.readdirSync(path.join(dir, 'history')).filter((name) => /^attempt-\d+-test\.json$/i.test(name)).length
    : 0;
  // The durable retry count is the number of retries actually represented by
  // test history. This repairs old state where blocked transitions were counted
  // but later failed/unverified attempts were not.
  const recordedRetries = Math.max(0, recordedAttempts - 1);
  const retries = Math.max(
    Number.isFinite(Number(localStatus.retries)) ? Number(localStatus.retries) : 0,
    recordedRetries
  );
  if (!checkOnly && retries !== Number(localStatus.retries || 0)) {
    localStatus = { ...localStatus, retries };
    fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify(localStatus, null, 2) + "\n", 'utf8');
  }
  const retryLimit = Number.isFinite(Number(localStatus.retryLimit)) ? Number(localStatus.retryLimit) : 3;
  // Failed attempts can be marked Evidence Reviewed, so retry from the
  // persisted outcome as well as from a blocked QA status.
  const retryableOutcome = ['failed', 'blocked', 'unverified'].includes(String(localStatus.qaOutcome || '').trim().toLowerCase());
  const qaStatusKey = String(localStatus.qaStatus || '').trim().toLowerCase();
  const retryableStatus = qaStatusKey === 'blocked';
  const newRetryableAttempt = retryableOutcome
    && !['ready for testing', 'retry queued'].includes(qaStatusKey)
    && !(latestAttempt && latestNumber > reviewNumber);
  // Only a Passed review is terminal. An inconclusive evidence review needs
  // another test attempt while the retry budget remains.
  const successfulReview = reviewHasReport
    && String(review?.overallOutcome || '').trim().toLowerCase() === 'passed';
  if (!successfulReview) {
    if ((retryableStatus || newRetryableAttempt) && retries < retryLimit) {
    localStatus = {
      ...localStatus,
      qaStatus: 'Ready for Testing',
      workflowState: 'Retry Queued',
      retries: retries + 1,
      retryLimit,
      blockedStage: null,
      nextAction: 'Create retry handoff',
      updatedAt: new Date().toISOString()
    };
    if (!checkOnly) fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify(localStatus, null, 2) + "\n", 'utf8');
    }
  }
  // A previous publisher can leave blockedStage behind while a stale review status
  // remains. Treat that combination as a queued retry instead of suppressing work.
  if (localStatus.blockedStage && localStatus.qaStatus !== 'Blocked' && retries < retryLimit) {
    localStatus = {
      ...localStatus,
      qaStatus: 'Ready for Testing',
      workflowState: 'Retry Queued',
      blockedStage: null,
      nextAction: `Retry ${retries}/${retryLimit} queued; coordinator will start tester`,
      updatedAt: new Date().toISOString()
    };
    if (!checkOnly) fs.writeFileSync(statusPath, JSON.stringify(localStatus, null, 2) + "\n", 'utf8');
  }
  // A final blocked test is not terminal until evidence review has produced its
  // report.  Once that report exists, it is terminal for automatic testing.
  const exhaustedFinalBlock = retries >= retryLimit && (
    ['blocked', 'failed', 'unverified'].includes(String(localStatus.qaOutcome || '').trim().toLowerCase())
    || String(latestAttempt?.qaStatus || '').trim().toLowerCase() === 'blocked'
  );
  if (exhaustedFinalBlock) {
    localStatus = reviewHasReport
      ? {
          ...localStatus,
          qaStatus: 'Blocked',
          workflowState: 'Blocked',
          blockedStage: 'reviewed',
          nextAction: 'Manual review required; final evidence report published'
        }
      : {
          ...localStatus,
          qaStatus: 'Awaiting Evidence Review',
          workflowState: ticket.jira.status || localStatus.workflowState,
          blockedStage: 'evidence_review',
          nextAction: 'Create final evidence review handoff'
        };
    if (!checkOnly) fs.writeFileSync(statusPath, JSON.stringify(localStatus, null, 2) + '\n', 'utf8');
  }
  return { ...ticket, status: mergeStatus(ticket, localStatus) };
}

function criteriaMarkdown(ticket) {
  const lines = ticket.acceptanceCriteria.length
    ? ticket.acceptanceCriteria.map((line) => `- [ ] ${line}`).join('\n')
    : '- No acceptance criteria extracted from the Jira description.';
  return `<!-- Generated from Jira acceptance criteria. -->

${lines}
`;
}
function markdown(ticket) {
  const criteria = ticket.acceptanceCriteria.length
    ? ticket.acceptanceCriteria.map((line, i) => `${i + 1}. ${line}`).join('\n')
    : 'No acceptance criteria extracted.';
  const subtasks = ticket.subtasks.length
    ? ticket.subtasks.map((s) => `- ${s.key}: ${s.summary} (${s.status})`).join('\n')
    : 'No subtasks imported.';
  return `# ${ticket.key}: ${ticket.summary}\n\n## Current State\n\n- Jira status: ${ticket.jira.status || 'Unknown'}\n- QA outcome: ${ticket.status.qaOutcome}\n- Workflow state: ${ticket.status.workflowState}\n- Action owner: ${ticket.status.actionOwner}\n- Next action: ${ticket.status.nextAction}\n- Jira: ${ticket.jira.url}\n\n## Acceptance Criteria\n\n${criteria}\n\n## Subtasks\n\n${subtasks}\n\n## Description\n\n${ticket.description || 'No description imported.'}\n`;
}

function criteriaReady(ticket) {
  const file = path.join(root, 'tickets', ticket.key, 'criteria.md');
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, 'utf8');
  if (/No acceptance criteria extracted/i.test(text)) return false;
  return /^-\s+\[ \]\s+\S/m.test(text);
}

function jiraReadyForTesting(ticket) {
  return String(ticket.jira.status || '').trim().toLowerCase() === 'ready for testing';
}

function handoffFor(ticket) {
  const qaStatus = String(ticket.status.qaStatus || '').trim().toLowerCase();
  const workflowState = String(ticket.status.workflowState || '').trim().toLowerCase();
  const nextAction = String(ticket.status.nextAction || '').trim().toLowerCase();
  const retries = Number(ticket.status.retries || 0);
  const retryLimit = Number(ticket.status.retryLimit || 3);
  const historyDir = path.join(ticketsDir, ticket.key, 'history');
  const attempts = fs.existsSync(historyDir)
    ? fs.readdirSync(historyDir).filter((name) => /^attempt-\d+-test\.json$/i.test(name)).sort()
    : [];
  const latestAttempt = Number(attempts.at(-1)?.match(/attempt-(\d+)-test/i)?.[1] || 0);
  const review = readJson(path.join(ticketsDir, ticket.key, 'review.json'), null);
  const reviewedAttempt = Number(review?.historyAttempt || review?.evidenceFolder?.match(/attempt-(\d+)/i)?.[1] || 0);
  const reviewHasReport = review?.noOp !== true
    && reviewedAttempt >= latestAttempt
    && fs.existsSync(path.join(ticketsDir, ticket.key, 'report.pdf'))
    && fs.statSync(path.join(ticketsDir, ticket.key, 'report.pdf')).size > 0;
  const guideImpactPolicy = readJson(guideImpactPolicyPath, { enabled: false, onlyForPassedEvidenceReviews: true });
  const guideUpdatePolicy = readJson(guideUpdatePolicyPath, { enabled: false, onlyForPassedEvidenceReviews: true });
  const guideImpact = readJson(path.join(ticketsDir, ticket.key, 'guide-impact.json'), null);
  const guideUpdate = readJson(path.join(ticketsDir, ticket.key, 'guide-update.json'), null);
  if (ticket.status.criteriaVerified !== true) {
    return {
      handoffId: `handoff-${ticket.key}-criteria`,
      handoffVersion: `${ticket.key}:criteria_conversion:${ticket.jira.updated || ticket.source.importedAt || 'current'}`,
      action: 'criteria_conversion',
      brief: 'docs/briefs/criteria-conversion.md',
      owner: 'criteria-converter',
      ticket: ticket.key,
      inputs: { ticketJson: `tickets/${ticket.key}/ticket.json`, generated: `status/generated/${ticket.key}.json` },
      expectedOutput: { path: `tickets/${ticket.key}/criteria.md`, schema: 'v4-qa-criteria.v1' }
    };
  }
  const needsReview = jiraReadyForTesting(ticket)
    && fs.existsSync(path.join(ticketsDir, ticket.key, 'results.json'))
    && latestAttempt > reviewedAttempt
    && !reviewHasReport
    && (ticket.status.qaStatus === 'Awaiting Evidence Review' || retries >= retryLimit);
  if (needsReview) {
    return {
      handoffId: `handoff-${ticket.key}-review-attempt-${String(latestAttempt).padStart(3, '0')}`,
      handoffVersion: `${ticket.key}:evidence_review:${latestAttempt}`,
      attempt: latestAttempt,
      action: 'evidence_review',
      brief: 'docs/briefs/evidence-review.md',
      owner: 'evidence-reviewer',
      ticket: ticket.key,
      inputs: { results: `tickets/${ticket.key}/results.json`, generated: `status/generated/${ticket.key}.json` },
      expectedOutput: { path: `tickets/${ticket.key}/review.json`, schema: 'v4-qa-review.v1' }
    };
  }
  const passedReview = passedEvidenceReview(path.join(ticketsDir, ticket.key), review, latestAttempt, reviewedAttempt, latestAttempt);
  if (guideImpactPolicy.enabled === true
    && guideImpactPolicy.onlyForPassedEvidenceReviews === true
    && passedReview
    && !guideImpact?.decision) {
    return {
      handoffId: `handoff-${ticket.key}-guide-impact`,
      handoffVersion: `${ticket.key}:guide_impact_assessment:${latestAttempt}`,
      action: 'guide_impact_assessment',
      brief: 'docs/briefs/user-guide-impact.md',
      owner: 'guide-impact-assessor',
      ticket: ticket.key,
      inputs: {
        ticketJson: `tickets/${ticket.key}/ticket.json`,
        generated: `status/generated/${ticket.key}.json`,
        review: `tickets/${ticket.key}/review.json`,
        report: `tickets/${ticket.key}/report.md`,
        policy: 'config/user-guide-impact-policy.json'
      },
      expectedOutput: { path: `tickets/${ticket.key}/guide-impact.json`, schema: 'v4-user-guide-impact.v1' }
    };
  }
  if (guideUpdatePolicy.enabled === true
    && guideUpdatePolicy.onlyForPassedEvidenceReviews === true
    && guideImpact?.decision === 'update_required'
    && passedReview
    && !guideUpdate?.title) {
    return {
      handoffId: `handoff-${ticket.key}-guide-update`,
      handoffVersion: `${ticket.key}:guide_update_authoring:${latestAttempt}`,
      action: 'guide_update_authoring',
      brief: 'docs/briefs/user-guide-authoring.md',
      owner: 'guide-update-author',
      ticket: ticket.key,
      inputs: {
        ticketJson: `tickets/${ticket.key}/ticket.json`,
        generated: `status/generated/${ticket.key}.json`,
        review: `tickets/${ticket.key}/review.json`,
        report: `tickets/${ticket.key}/report.md`,
        results: `tickets/${ticket.key}/results.json`,
        impact: `tickets/${ticket.key}/guide-impact.json`,
        policy: 'config/user-guide-update-policy.json'
      },
      expectedOutput: { path: `tickets/${ticket.key}/guide-update.json`, schema: 'v4-user-guide-update.v1' }
    };
  }
  const testingEligible = jiraReadyForTesting(ticket)
    && retries < retryLimit
    && (qaStatus === 'ready for testing' || qaStatus === 'retry queued' || workflowState === 'retry queued' || nextAction === 'create testing handoff')
    && criteriaReady(ticket);
  if (testingEligible) {
    const nextAttempt = Math.max(1, latestAttempt + 1);
    return {
      handoffId: workflowState === 'retry queued'
        ? `handoff-${ticket.key}-retry-attempt-${String(nextAttempt).padStart(3, '0')}`
        : `handoff-${ticket.key}-test-attempt-${String(nextAttempt).padStart(3, '0')}`,
      handoffVersion: `${ticket.key}:test_ticket:${nextAttempt}`,
      attempt: nextAttempt,
      action: 'test_ticket',
      brief: 'docs/briefs/qa-testing.md',
      owner: 'ticket-tester',
      ticket: ticket.key,
      inputs: {
        criteria: `tickets/${ticket.key}/criteria.md`,
        ticketJson: `tickets/${ticket.key}/ticket.json`,
        status: `tickets/${ticket.key}/status.json`
      },
      expectedOutput: { path: `tickets/${ticket.key}/results.json`, schema: 'v4-qa-test-result.v1' }
    };
  }
  return null;
}

const ticketDirs = fs.existsSync(ticketsDir)
  ? fs.readdirSync(ticketsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(ticketsDir, entry.name, 'ticket.json')))
    .map((entry) => entry.name)
    .sort()
  : [];

const tickets = ticketDirs.map(normalizeTicket);
const handoffs = tickets.map(handoffFor).filter(Boolean);
// status/generated is a derived projection. Remove records for ticket folders
// that the importer has deleted so stale tickets cannot remain in GitHub.
if (!checkOnly && fs.existsSync(generatedDir)) {
  const activeKeys = new Set(tickets.map((ticket) => ticket.key));
  for (const entry of fs.readdirSync(generatedDir, { withFileTypes: true })) {
    if (!entry.isFile() || !/^TEST2-\d+\.json$/.test(entry.name)) continue;
    const key = entry.name.slice(0, -'.json'.length);
    if (!activeKeys.has(key)) fs.rmSync(path.join(generatedDir, entry.name), { force: true });
  }
}
const generatedAt = tickets.map((t) => t.status.updatedAt || t.jira.updated || t.jira.created).filter(Boolean).sort().at(-1) || null;
const displayTickets = [...tickets].sort((a, b) => String(a.jira.status || 'Unknown').localeCompare(String(b.jira.status || 'Unknown')) || a.key.localeCompare(b.key, undefined, { numeric: true }));
const summary = {
  schema: 'v4-qa-status.v1',
  generatedAt,
  counts: {
    tickets: tickets.length,
    handoffs: handoffs.length,
    byWorkflowState: Object.fromEntries([...new Set(tickets.map((t) => t.status.workflowState))].sort().map((state) => [state, tickets.filter((t) => t.status.workflowState === state).length])),
    byQaOutcome: Object.fromEntries([...new Set(tickets.map((t) => t.status.qaOutcome))].sort().map((outcome) => [outcome, tickets.filter((t) => t.status.qaOutcome === outcome).length]))
  },
  policy: {
    jira: 'read_only_import',
    codex: 'trigger_only_from_handoffs',
    tracker: 'publish_only_approved_status',
    missingEvidence: 'warning_not_pass'
  },
  tickets: displayTickets.map((t) => ({
    key: t.key,
    summary: t.summary,
    jiraStatus: t.jira.status,
    workflowState: t.status.workflowState,
    qaStatus: t.status.qaStatus,
    qaOutcome: t.status.qaOutcome,
    guideImpact: t.status.guideImpact?.decision || null,
    guideUpdate: t.status.guideUpdate?.title || null,
    actionOwner: t.status.actionOwner,
    nextAction: t.status.nextAction,
    updatedAt: t.status.updatedAt,
    retries: t.status.retries,
    retryLimit: 3,
    retryLabel: t.status.retries > 0 ? `Retry ${t.status.retries}/3` : ''
  }))
};

const report = ['# Ticket Status', '', `Updated: ${summary.generatedAt || 'unknown'}`, '', '| Ticket | Jira Status | QA Status | Retry | Summary |', '| --- | --- | --- | --- | --- |', ...displayTickets.map((t) => `| ${t.key} | ${t.jira.status || 'Unknown'} | ${t.status.qaStatus} | ${t.status.retries > 0 ? `Retry ${t.status.retries}/3` : ''} | ${t.summary.replace(/\|/g, '\\|')} |`) , ''].join('\n');
writeText(path.join(outDir, 'ticket-status.md'), report);

writeJson(path.join(outDir, 'tickets.json'), summary);
writeJson(path.join(outDir, 'handoffs.json'), { schema: 'v4-qa-handoffs.v1', generatedAt: summary.generatedAt, handoffs });
for (const ticket of tickets) {
  writeJson(path.join(generatedDir, `${ticket.key}.json`), ticket);
  const criteriaFile = path.join('tickets', ticket.key, 'criteria.md');
  // Seed new tickets only. Once present, criteria belong to the criteria worker;
  // polling Jira or bundling status must never replace the tester's checklist.
  if (!fs.existsSync(criteriaFile)) {
    writeText(criteriaFile, criteriaMarkdown(ticket));
  }
  writeText(path.join('tickets', ticket.key, 'ticket.md'), markdown(ticket));
}

console.log(JSON.stringify({ ok: true, tickets: tickets.length, handoffs: handoffs.length }, null, 2));





