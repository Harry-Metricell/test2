// Local diagnostics only: never publishes transcripts or estimates subscription charges.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const roles = new Set(['coordinator', 'criteria-conversion', 'qa-testing', 'evidence-review', 'user-guide-impact', 'user-guide-authoring']);
const fields = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'total_tokens'];
const normalize = value => String(value).replaceAll('\\', '/').replace(/^\/\/\?\//, '').replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase();
const validUsage = u => u && fields.every(k => Number.isSafeInteger(u[k]) && u[k] >= 0)
  && u.cached_input_tokens <= u.input_tokens && u.reasoning_output_tokens <= u.output_tokens;
const validRecord = r => r && /^[a-f0-9-]{36}$/.test(r.threadId || '') && roles.has(r.role)
  && (r.handoffId === null || /^handoff-TEST2-\d+(?:-[a-z0-9]+)+$/.test(r.handoffId || ''))
  && (r.ticket === null || r.ticket === r.handoffId?.match(/TEST2-\d+/)?.[0])
  && (r.status !== 'measured' || validUsage(r.usage));
const sourceName = value => /^\d{4}[\\/]\d\d[\\/]\d\d[\\/]rollout-[^\\/]+\.jsonl$/.test(value || '');

// Keep one last-known cumulative record per exact worker, never sums of polls.
// An unavailable source or a reset cannot erase a previously measured history.
export function retainRecord(previous, current) {
  if (!validRecord(current)) return previous;
  if (!validRecord(previous)) return current;
  if (previous.role !== current.role || previous.handoffId !== current.handoffId) return previous;
  if (String(current.observedAt || '') < String(previous.observedAt || '')) return previous;
  const decreases = previous.status === 'measured' && current.status === 'measured'
    && fields.some(k => current.usage[k] < previous.usage[k]);
  if (previous.status === 'measured' && (current.status !== 'measured' || decreases)) {
    return { ...previous, latestCollectionStatus: decreases ? 'counter_reset' : current.status };
  }
  return current;
}

export function usageRecord(events, roots, bindings = {}) {
  const meta = events.find(e => e?.type === 'session_meta')?.payload;
  if (!meta || meta.thread_source === 'guardian_review' || meta.source?.subagent?.other === 'guardian') return null;
  let selection, usage, observedAt, reset = false, model, ownUsage, ownObservedAt, ownReset = false;
  for (const event of events) {
    const p = event?.payload || {};
    if (event?.type === 'turn_context' && typeof p.model === 'string') model = p.model;
    let text;
    if (event?.type === 'response_item' && p.role === 'user') {
      text = (Array.isArray(p.content) ? p.content : []).map(x => x?.text || '').join('\n');
    } else if (meta.thread_source === 'agent_created_thread' && event?.type === 'response_item'
        && p.type === 'function_call_output' && p.namespace === 'codex_app' && p.name === 'create_thread'
        && typeof p.output === 'string' && p.output.trimStart().startsWith('<codex_delegation>')) {
      // Incoming task instructions are stored as a delegation envelope in the
      // current desktop format, not necessarily as a user-message item.
      text = p.output.match(/<input>([\s\S]*?)<\/input>/)?.[1];
    }
    if (typeof text === 'string') {
      // Only an explicit worker launch identifies a role; incidental ticket mentions do not.
      const m = text.match(/read and follow\s*:\s*docs\/briefs\/([a-z-]+)\.md(?:\s+for handoff\s+(handoff-TEST2-\d+(?:-[a-z0-9]+)+))?/i);
      if (m && roles.has(m[1])) {
        const next = { role: m[1], handoffId: m[2] || null };
        if (selection && (selection.role !== next.role || selection.handoffId !== next.handoffId)) return null;
        selection = next;
      }
    }
    if (event?.type === 'token_usage_record' && p.thread_id === meta.id && validUsage(p.thread_token_usage)) {
      if (ownUsage && p.thread_token_usage.total_tokens < ownUsage.total_tokens) ownReset = true;
      ownUsage = Object.fromEntries(fields.map(k => [k, p.thread_token_usage[k]]));
      ownObservedAt = event.timestamp;
    }
    if (event?.type === 'event_msg' && p.type === 'token_count' && p.info?.total_token_usage) {
      const candidate = p.info.total_token_usage;
      if (!validUsage(candidate)) continue;
      if (usage && candidate.total_tokens < usage.total_tokens) reset = true;
      usage = Object.fromEntries(fields.map(k => [k, candidate[k]]));
      observedAt = event.timestamp;
    }
  }
  if (ownUsage) { usage = ownUsage; observedAt = ownObservedAt; reset = ownReset; }
  const bound = bindings[meta.id];
  if (bound && selection && (bound.role !== selection.role || bound.handoffId !== selection.handoffId)) return null;
  if (!selection && bound && roles.has(bound.role)) selection = { role: bound.role, handoffId: bound.handoffId };
  if (!meta || !selection || !roots.some(root => normalize(root) === normalize(meta.cwd))) return null;
  if (!/^[a-f0-9-]{36}$/.test(meta.id || '')) return null;
  // Exact-thread records distinguish child usage from copied parent history.
  // Without that proof, parented chats still require a reliable fork baseline.
  const status = meta.parent_thread_id && !ownUsage ? 'fork_baseline_unavailable' : reset ? 'counter_reset' : usage ? 'measured' : 'usage_unavailable';
  return { threadId: meta.id, ...selection, ticket: selection.handoffId?.match(/TEST2-\d+/)?.[0] || null,
    status, counterSource: ownUsage ? 'exact_thread_usage_record' : 'legacy_cumulative_event', observedAt: typeof observedAt === 'string' ? observedAt : null,
    models: model && /^[a-z0-9._-]{1,100}$/i.test(model) ? [model] : [],
    usage: status === 'measured' ? usage : null };
}

// Bounded head/tail reads find launch metadata and latest cumulative counters.
// Oversized/incomplete lines are ignored; missing counters are unavailable, never zero.
function readEvents(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size, window = 512 * 1024;
    const chunk = (start, length) => {
      const b = Buffer.alloc(length); const n = fs.readSync(fd, b, 0, length, start);
      return b.subarray(0, n).toString('utf8');
    };
    const head = chunk(0, Math.min(size, window));
    const tail = size > window ? chunk(Math.max(window, size - window), Math.min(window, size - window)) : '';
    const lines = head.split('\n');
    if (size > window) lines.pop();
    if (tail) lines.push(...tail.split('\n').slice(1));
    return lines.flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
  } finally { fs.closeSync(fd); }
}

export function collectUsage({ repo, sessionsRoot = path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'sessions'),
  roots = [repo], now = new Date(), days = 14 } = {}) {
  if (!repo || !Number.isInteger(days) || days < 1 || days > 90) throw new Error('Invalid usage collection options');
  const outputDir = path.join(repo, '.agent-staging', 'usage');
  fs.mkdirSync(outputDir, { recursive: true });
  const cachePath = path.join(outputDir, 'cache.json');
  const ledgerPath = path.join(outputDir, 'ledger.json');
  const scopeKey = [normalize(sessionsRoot), ...roots.map(normalize).sort()].join('|');
  let ledger;
  try { const value = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    if (value.schema === 'test2-token-ledger.v1' && value.scopeKey === scopeKey && Array.isArray(value.entries)) ledger = value;
  } catch {}
  const bindingsPath = path.join(outputDir, 'threads.json');
  let bindings = {};
  try { bindings = JSON.parse(fs.readFileSync(bindingsPath, 'utf8')); } catch {}
  const stages = { criteria_conversion: 'criteria-conversion', test_ticket: 'qa-testing', evidence_review: 'evidence-review',
    guide_impact_assessment: 'user-guide-impact', guide_update_authoring: 'user-guide-authoring' };
  try {
    const state = JSON.parse(fs.readFileSync(path.join(repo, '.agent-staging', 'coordinator-run-state.json'), 'utf8'));
    for (const item of state.active || []) {
      if (/^[a-f0-9-]{36}$/.test(item.childTaskId || '') && stages[item.stage]
          && /^handoff-TEST2-\d+(?:-[a-z0-9]+)+$/.test(item.handoffId || '')) {
        bindings[item.childTaskId] = { role: stages[item.stage], handoffId: item.handoffId };
      }
    }
  } catch {} // Missing private bookkeeping does not imply a worker or publication failure.
  let previous = {};
  try { previous = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch {}
  const cache = {}, records = new Map(), sources = new Map(), files = new Set();
  let unreadable = 0, scanned = 0;
  for (const entry of ledger?.entries || []) {
    if (!validRecord(entry.record) || !sourceName(entry.source)) continue;
    records.set(entry.record.threadId, entry.record); sources.set(entry.record.threadId, entry.source); files.add(entry.source);
  }
  // One bounded history discovery on installation, followed by cheap recent
  // discovery plus refreshes of known workers even when their chats are old.
  const discoveryDays = ledger ? days : Math.max(days, 90);
  for (let d = 0; d < discoveryDays; d++) {
    const date = new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10).replaceAll('-', path.sep);
    const folder = path.join(sessionsRoot, date);
    let names;
    try { names = fs.readdirSync(folder).filter(f => /^rollout-.*\.jsonl$/.test(f)).sort(); }
    catch (e) { if (e.code !== 'ENOENT') unreadable++; continue; }
    for (const name of names) files.add(path.join(date, name));
  }
  for (const key of [...files].sort()) {
      if (!sourceName(key)) continue;
      scanned++;
      try {
        const file = path.join(sessionsRoot, key), stat = fs.lstatSync(file);
        if (!stat.isFile() || stat.isSymbolicLink()) { unreadable++; continue; }
        const signature = `v3:${stat.size}:${stat.mtimeMs}:${scopeKey}:${JSON.stringify(bindings)}`;
        const record = previous[key]?.signature === signature ? previous[key].record : usageRecord(readEvents(file), roots, bindings);
        cache[key] = { signature, record };
        if (validRecord(record)) {
          records.set(record.threadId, retainRecord(records.get(record.threadId), record));
          sources.set(record.threadId, key);
        }
      } catch { unreadable++; }
  }
  const sessions = [...records.values()].sort((a, b) => a.threadId.localeCompare(b.threadId));
  const totalsByRole = {};
  for (const record of sessions.filter(s => s.status === 'measured')) {
    const total = totalsByRole[record.role] ||= { sessions: 0, ...Object.fromEntries(fields.map(k => [k, 0])) };
    total.sessions++;
    for (const k of fields) total[k] += record.usage[k];
  }
  const report = { schema: 'test2-local-token-usage.v1', generatedAt: now.toISOString(), days,
    source: 'local_session_cumulative_counters', scope: 'recognised_QA_launches_only',
    complete: false, scannedFiles: scanned, unreadableFiles: unreadable,
    aggregation: 'retained_measured_history', discoveryDays: days,
    sourceAvailable: fs.existsSync(sessionsRoot),
    limitations: ['Not subscription credits or money', 'Cached input is included in input; reasoning is included in output',
      'Retained last-known worker history; recent discovery plus known older workers, initial discovery bounded to 90 days',
      'Remote/archived/unrecognised/multi-handoff chats remain excluded; missing files do not erase retained measurements',
      'Bounded log windows may miss launch identity or usage; unproven fork baselines and approval-helper chats excluded', 'Model is last observed, not per-model billing'],
    totalsByRole, sessions };
  const nextLedger = { schema: 'test2-token-ledger.v1', scopeKey,
    entries: sessions.map(record => ({ source: sources.get(record.threadId), record })) };
  for (const [file, value] of [['ledger.json', nextLedger], ['threads.json', bindings], ['cache.json', cache], ['summary.json', report]]) {
    const target = path.join(outputDir, file), pending = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(pending, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(pending, target);
  }
  const rows = Object.entries(totalsByRole).map(([role, u]) =>
    `| ${role} | ${u.sessions} | ${u.input_tokens - u.cached_input_tokens} | ${u.cached_input_tokens} | ${u.output_tokens} | ${u.total_tokens} |`);
  fs.writeFileSync(path.join(outputDir, 'summary.md'), [
    '# Local QA token usage', '', `Updated: ${report.generatedAt}. Retained measured history; new-session discovery: ${days} days.`, '',
    '**Partial coverage; token counters are not subscription credits or monetary charges.**', '',
    '| Role | Measured chats | Uncached input | Cached input | Output | Total |',
    '| --- | --- | --- | --- | --- | --- |', ...rows, '',
    `Recognised but unmeasured chats: ${sessions.filter(s => s.status !== 'measured').length}. Unreadable files: ${unreadable}.`, '',
    ...report.limitations.map(item => `- ${item}`), '',
    'Per-thread and per-handoff counters are in summary.json. Chat text, screenshots and credentials are not copied.', '',
  ].join('\n'));
  return { path: path.join(outputDir, 'summary.json'), measuredSessions: sessions.filter(s => s.status === 'measured').length, unreadableFiles: unreadable };
}

export function serviceUsage(repo) {
  if (process.env.TEST2_USAGE_DISABLED === '1') return;
  const roots = process.env.TEST2_USAGE_PROJECT_ROOTS?.split(path.delimiter).filter(Boolean)
    || [repo, ...(path.basename(repo).toLowerCase() === 'test2-github' ? [path.join(path.dirname(repo), 'Test2')] : [])];
  return collectUsage({ repo, roots });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(serviceUsage(path.resolve(process.argv[2] || '.')) || { disabled: true })); }
  catch { console.error(JSON.stringify({ error: 'usage_collection_unavailable' })); process.exitCode = 1; }
}
