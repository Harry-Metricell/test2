// A cycle owns its attempt history. Legacy tickets are cycle-001 until Jira
// records a genuine return from rework; deploying this module never resets QA.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const firstCycle = 'cycle-001';
export function cycleId(value = firstCycle) {
  if (!/^cycle-\d{3,}$/.test(value) || Number(value.slice(6)) < 1) throw new Error('Invalid testing cycle');
  return value;
}
export function readCycle(dir) {
  const file = path.join(dir, 'qa-cycle.json');
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { cycleId: firstCycle };
  if (typeof state?.cycleId !== 'string') throw new Error('Testing cycle metadata is missing its identity');
  cycleId(state.cycleId);
  return state;
}
export function publicationStillCurrent(repo, output, selectedCycle, action) {
  const file = path.join(repo, 'status', 'handoffs.json');
  const queue = JSON.parse(fs.readFileSync(file, 'utf8'));
  const current = queue.handoffs?.find(h => h.handoffId === output.handoffId);
  return readCycle(path.join(repo, 'tickets', output.ticket)).cycleId === selectedCycle
    && current?.handoffVersion === output.handoffVersion
    && current?.ticket === output.ticket && current?.action === action;
}
export function evidenceBase(key, cycle = firstCycle) {
  return cycleId(cycle) === firstCycle ? key : `${key}/cycles/${cycle}`;
}
export function latestGuideRecord(repo, key) {
  for (const base of ['tickets', 'archive/tickets']) {
    const dir = path.join(repo, base, key);
    const current = path.join(dir, 'guide-update.json');
    if (fs.existsSync(current)) return current;
    const archive = path.join(dir, 'cycles');
    if (!fs.existsSync(archive)) continue;
    const found = fs.readdirSync(archive).filter(name => /^cycle-\d+$/.test(name)).sort().reverse()
      .map(name => path.join(archive, name, 'guide-update.json')).find(file => fs.existsSync(file));
    if (found) return found;
  }
  return null;
}
export function scopeHandoff(handoff, cycle = firstCycle) {
  if (!handoff) return null;
  cycleId(cycle);
  const scoped = { ...handoff, cycleId: cycle, inputs: { ...handoff.inputs } };
  if (cycle !== firstCycle) {
    scoped.inputs.cycle = `tickets/${handoff.ticket}/qa-cycle.json`;
    scoped.handoffId = handoff.handoffId.replace(`handoff-${handoff.ticket}-`, `handoff-${handoff.ticket}-${cycle}-`);
    scoped.handoffVersion = handoff.handoffVersion.replace(`${handoff.ticket}:`, `${handoff.ticket}:${cycle}:`);
  }
  if (handoff.attempt) scoped.inputs.evidenceFolder = `${evidenceBase(handoff.ticket, cycle)}/screenshots/attempt-${String(handoff.attempt).padStart(3, '0')}`;
  return scoped;
}
const sourceHash = issue => createHash('sha256').update(JSON.stringify([issue.fields?.summary || '', issue.fields?.description || null])).digest('hex');
const ready = status => String(status || '').trim().toLowerCase() === 'ready for testing';
const rework = status => ['to do', 'in progress', 'blocked', 'rejected', 'done'].includes(String(status || '').trim().toLowerCase());

export function syncTestingCycle(dir, issue, previousIssue, previousStatus) {
  const file = path.join(dir, 'qa-cycle.json');
  const exists = fs.existsSync(file);
  let state = exists ? readCycle(dir) : {
    schema: 'v4-qa-cycle.v1', cycleId: firstCycle,
    sourceHash: sourceHash(previousIssue || issue), processedTransitions: [],
    reworkPending: rework(previousIssue?.fields?.status?.name), lastJiraStatus: previousIssue?.fields?.status?.name || issue.fields?.status?.name
  };
  if (exists && (state.schema !== 'v4-qa-cycle.v1' || !Array.isArray(state.processedTransitions) || typeof state.sourceHash !== 'string')) throw new Error(`${issue.key}: invalid cycle checkpoint; refusing to replay history`);
  const history = issue.qaStatusHistory;
  // Real imports must provide a complete changelog. Legacy fixtures can still
  // import snapshots, but cannot silently infer or reset a testing cycle.
  if (history && (history.complete !== true || !Array.isArray(history.transitions))) throw new Error(`${issue.key}: incomplete Jira status history`);
  const transitions = history?.transitions || [];
  const seen = new Set(state.processedTransitions);
  const previousTime = Date.parse(previousIssue?.fields?.updated || '');
  let reset = false;
  for (const event of transitions) {
    if (!event.id || !Number.isFinite(Date.parse(event.at)) || typeof event.to !== 'string') throw new Error(`${issue.key}: invalid Jira transition`);
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    // On first deployment, baseline historical events, processing only those
    // newer than the last imported snapshot. New tickets never replay old QA.
    if (!exists && (!previousIssue || !Number.isFinite(previousTime) || Date.parse(event.at) <= previousTime)) continue;
    if (rework(event.to)) state.reworkPending = true;
    if (ready(event.to) && state.reworkPending) {
      const hasTest = fs.existsSync(path.join(dir, 'results.json')) || (fs.existsSync(path.join(dir, 'history')) && fs.readdirSync(path.join(dir, 'history')).some(n => /^attempt-\d+-test\.json$/.test(n)));
      if (hasTest) {
        const oldCycle = state.cycleId;
        const archive = path.join(dir, 'cycles', oldCycle);
        if (fs.existsSync(archive)) throw new Error(`${issue.key}: cycle archive already exists; refusing overwrite`);
        fs.mkdirSync(archive, { recursive: true });
        for (const entry of fs.readdirSync(dir)) {
          if (['cycles', 'qa-cycle.json'].includes(entry)) continue;
          fs.renameSync(path.join(dir, entry), path.join(archive, entry));
        }
        fs.writeFileSync(path.join(archive, 'qa-cycle.json'), JSON.stringify({ ...state, completedByTransition: event.id, archivedAt: event.at }, null, 2) + '\n');
        const unchanged = state.sourceHash === sourceHash(issue);
        if (unchanged && previousStatus.criteriaVerified === true && fs.existsSync(path.join(archive, 'criteria.md'))) fs.copyFileSync(path.join(archive, 'criteria.md'), path.join(dir, 'criteria.md'));
        previousStatus = { ticket: issue.key, criteriaVerified: unchanged && previousStatus.criteriaVerified === true,
          qaStatus: 'Not Tested', workflowState: 'Ready', retries: 0, testAttempts: 0, retryLimit: 1 };
        state = { ...state, cycleId: `cycle-${String(Number(oldCycle.slice(6)) + 1).padStart(3, '0')}`, startedByTransition: event.id, startedAt: event.at, sourceHash: sourceHash(issue) };
        reset = true;
      }
      state.reworkPending = false;
    }
    state.lastJiraStatus = event.to;
  }
  // Baseline snapshots arm rework only for a ticket with an existing test.
  if (!exists && rework(issue.fields?.status?.name)) state.reworkPending = true;
  state.processedTransitions = [...seen];
  state.lastJiraStatus = issue.fields?.status?.name || state.lastJiraStatus;
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
  return { status: { ...previousStatus, cycleId: state.cycleId }, reset };
}
