import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const ticketsDir = path.join(root, 'tickets');
const outDir = path.join(root, 'status');
const generatedDir = path.join(outDir, 'generated');

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

function readJson(file, fallback = null) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    // Some legacy imports contain a complete JSON document followed by a duplicate.
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i += 1) {
      const ch = raw[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === '{') depth += 1;
      else if (ch === '}' && --depth === 0) {
        try {
          return JSON.parse(raw.slice(0, i + 1));
        } catch {
          break;
        }
      }
    }
    if (fallback !== null) return fallback;
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

function flattenAdf(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(flattenAdf).filter(Boolean).join('\n');
  const own = node.text || '';
  const children = node.content ? flattenAdf(node.content) : '';
  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem') return [own, children].filter(Boolean).join(' ').trim();
  if (node.type === 'bulletList' || node.type === 'orderedList') return children;
  return [own, children].filter(Boolean).join(' ').trim();
}

function acceptanceCriteria(descriptionText) {
  const marker = /Acceptance Criteria:\s*/i.exec(descriptionText);
  if (marker) {
    return descriptionText
      .slice(marker.index + marker[0].length)
      .split(/\n+/)
      .map((line) => line.replace(/\\n/g, '\n').replace(/^[-*]\s*/, '').trim())
      .filter((line) => line && !/^Object Change List:/i.test(line));
  }

  const concise = descriptionText.replace(/\s+/g, ' ').trim();
  if (!concise || concise.length > 500 || !/\b(should|must|shall|able to)\b/i.test(concise)) return [];

  const sentences = concise.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
  const actions = sentences.filter((line) => !/\b(?:should|must|shall) work\.?$/i.test(line));
  return actions.length ? actions : [concise];
}

function canonicalState(value, fallback = 'Imported') {
  const key = String(value || '').trim().toLowerCase();
  return STATUS_LABELS.get(key) || value || fallback;
}

function statusRank(state) {
  const i = STATUS_PRIORITY.indexOf(canonicalState(state));
  return i === -1 ? STATUS_PRIORITY.length : i;
}

function mergeStatus(ticket, localStatus) {
  const jiraState = canonicalState(ticket.jira.status, 'Imported');
  const localState = canonicalState(localStatus.workflowState || localStatus.status, 'Imported');
  const workflowState = statusRank(localState) <= statusRank(jiraState) ? localState : jiraState;
  return {
    jiraStatus: ticket.jira.status || 'Unknown',
    workflowState,
    qaStatus: localStatus.qaStatus || 'Not Tested',
    qaOutcome: localStatus.qaOutcome || localStatus.outcome || 'Not Tested',
    automationSuitability: localStatus.automationSuitability || 'Unclassified',
    actionOwner: localStatus.actionOwner || 'Coordinator',
    nextAction: localStatus.nextAction || defaultNextAction(workflowState),
    reviewState: localStatus.reviewState || 'Not Reviewed',
    updatedAt: localStatus.updatedAt || ticket.jira.updated || ticket.source.importedAt || null
  };
}

function defaultNextAction(workflowState) {
  if (workflowState === 'Blocked') return 'Hold until dependency changes';
  if (workflowState === 'Retry Queued') return 'Create retry handoff';
  if (workflowState === 'Ready') return 'Create criteria conversion handoff';
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
  const localStatus = readJson(path.join(dir, 'status.json'), {});
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

function handoffFor(ticket) {
  if ((ticket.status.workflowState === 'Ready' || ticket.status.workflowState === 'Imported') && ticket.acceptanceCriteria.length === 0 && !criteriaReady(ticket)) {
    return {
      handoffId: `handoff-${ticket.key}-criteria`,
      action: 'criteria_conversion',
      brief: 'docs/briefs/criteria-conversion.md',
      owner: 'criteria-converter',
      ticket: ticket.key,
      inputs: { ticketJson: `tickets/${ticket.key}/ticket.json`, generated: `status/generated/${ticket.key}.json` },
      expectedOutput: { path: `tickets/${ticket.key}/criteria.md`, schema: 'v4-qa-criteria.v1' }
    };
  }
  if (ticket.status.workflowState === 'Retry Queued') {
    return {
      handoffId: `handoff-${ticket.key}-retry`,
      action: 'retry_test',
      brief: 'docs/briefs/qa-testing.md',
      owner: 'ticket-tester',
      ticket: ticket.key,
      inputs: { generated: `status/generated/${ticket.key}.json` },
      expectedOutput: { path: `tickets/${ticket.key}/results.json`, schema: 'v4-qa-test-result.v1' }
    };
  }
  if (ticket.status.workflowState === 'Executed') {
    return {
      handoffId: `handoff-${ticket.key}-review`,
      action: 'evidence_review',
      brief: 'docs/briefs/evidence-review.md',
      owner: 'evidence-reviewer',
      ticket: ticket.key,
      inputs: { results: `tickets/${ticket.key}/results.json`, generated: `status/generated/${ticket.key}.json` },
      expectedOutput: { path: `tickets/${ticket.key}/review.json`, schema: 'v4-qa-review.v1' }
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
const criteriaQueue = handoffs.filter((handoff) => handoff.action === 'criteria_conversion');
const generatedAt = tickets.map((t) => t.status.updatedAt || t.jira.updated || t.jira.created).filter(Boolean).sort().at(-1) || null;
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
  tickets: tickets.map((t) => ({
    key: t.key,
    summary: t.summary,
    jiraStatus: t.jira.status,
    workflowState: t.status.workflowState,
    qaStatus: t.status.qaStatus,
    qaOutcome: t.status.qaOutcome,
    actionOwner: t.status.actionOwner,
    nextAction: t.status.nextAction,
    updatedAt: t.status.updatedAt
  }))
};

const report = ['# Ticket Status', '', `Updated: ${summary.generatedAt || 'unknown'}`, '', '| Ticket | Jira Status | QA Status | Summary |', '| --- | --- | --- | --- |', ...tickets.map((t) => `| ${t.key} | ${t.jira.status || 'Unknown'} | ${t.status.qaStatus} | ${t.summary.replace(/\|/g, '\\|')} |`) , ''].join('\n');
writeText(path.join(outDir, 'ticket-status.md'), report);

writeJson(path.join(outDir, 'tickets.json'), summary);
writeJson(path.join(outDir, 'handoffs.json'), { schema: 'v4-qa-handoffs.v1', generatedAt: summary.generatedAt, handoffs });
writeJson(path.join(outDir, 'codex-criteria-queue.json'), { schema: 'v4-qa-criteria-queue.v1', generatedAt: summary.generatedAt, tickets: criteriaQueue.map((handoff) => ({ ticket: handoff.ticket, handoffId: handoff.handoffId, brief: handoff.brief, inputs: handoff.inputs, output: handoff.expectedOutput })) });
for (const ticket of tickets) {
  writeJson(path.join(generatedDir, `${ticket.key}.json`), ticket);
  const criteriaFile = path.join('tickets', ticket.key, 'criteria.md');
  if (ticket.acceptanceCriteria.length > 0 || !fs.existsSync(criteriaFile)) {
    writeText(criteriaFile, criteriaMarkdown(ticket));
  }
  writeText(path.join('tickets', ticket.key, 'ticket.md'), markdown(ticket));
}

console.log(JSON.stringify({ ok: true, tickets: tickets.length, handoffs: handoffs.length }, null, 2));
