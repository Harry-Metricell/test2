// Local diagnostics only: never publishes transcripts or estimates subscription charges.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const roles = new Set(['coordinator', 'criteria-conversion', 'qa-testing', 'evidence-review', 'user-guide-impact', 'user-guide-authoring']);
const fields = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'total_tokens'];
const normalize = value => String(value).replaceAll('\\', '/').replace(/\/+/g, '/').replace(/\/$/, '').toLowerCase();

export function usageRecord(events, roots, bindings = {}) {
  let meta, selection, usage, observedAt, reset = false, model;
  for (const event of events) {
    const p = event?.payload || {};
    if (event.type === 'session_meta') meta = p;
    if (event.type === 'turn_context' && typeof p.model === 'string') model = p.model;
    if (event.type === 'response_item' && p.role === 'user') {
      const text = (Array.isArray(p.content) ? p.content : []).map(x => x?.text || '').join('\n');
      // Only an explicit worker launch identifies a role; incidental ticket mentions do not.
      const m = text.match(/read and follow:\s*docs\/briefs\/([a-z-]+)\.md(?:\s+for handoff\s+(handoff-TEST2-\d+(?:-[a-z0-9]+)+))?/);
      if (m && roles.has(m[1])) {
        const next = { role: m[1], handoffId: m[2] || null };
        if (selection && (selection.role !== next.role || selection.handoffId !== next.handoffId)) return null;
        selection = next;
      }
    }
    if (event.type === 'event_msg' && p.type === 'token_count' && p.info?.total_token_usage) {
      const candidate = p.info.total_token_usage;
      if (!fields.every(k => Number.isSafeInteger(candidate[k]) && candidate[k] >= 0)) continue;
      if (candidate.cached_input_tokens > candidate.input_tokens || candidate.reasoning_output_tokens > candidate.output_tokens) continue;
      if (usage && candidate.total_tokens < usage.total_tokens) reset = true;
      usage = Object.fromEntries(fields.map(k => [k, candidate[k]]));
      observedAt = event.timestamp;
    }
  }
  if (!selection && meta && bindings[meta.id]) selection = bindings[meta.id];
  if (!meta || !selection || !roots.some(root => normalize(root) === normalize(meta.cwd))) return null;
  if (!/^[a-f0-9-]{36}$/.test(meta.id || '')) return null;
  // Forks can inherit cumulative usage: omit them until a reliable fork baseline exists.
  const status = meta.parent_thread_id ? 'fork_baseline_unavailable' : reset ? 'counter_reset' : usage ? 'measured' : 'usage_unavailable';
  return { threadId: meta.id, ...selection, ticket: selection.handoffId?.match(/TEST2-\d+/)?.[0] || null,
    status, observedAt: typeof observedAt === 'string' ? observedAt : null,
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
  const cache = {}, records = new Map(); let unreadable = 0, scanned = 0;
  for (let d = 0; d < days; d++) {
    const date = new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10).replaceAll('-', path.sep);
    const folder = path.join(sessionsRoot, date);
    let files;
    try { files = fs.readdirSync(folder).filter(f => /^rollout-.*\.jsonl$/.test(f)).sort(); }
    catch (e) { if (e.code !== 'ENOENT') unreadable++; continue; }
    for (const name of files) {
      const key = path.join(date, name); scanned++;
      try {
        const file = path.join(folder, name), stat = fs.lstatSync(file);
        if (!stat.isFile() || stat.isSymbolicLink()) { unreadable++; continue; }
        const signature = `${stat.size}:${stat.mtimeMs}:${roots.map(normalize).join('|')}:${JSON.stringify(bindings)}`;
        const record = previous[key]?.signature === signature ? previous[key].record : usageRecord(readEvents(file), roots, bindings);
        cache[key] = { signature, record };
        if (record && (!records.has(record.threadId) || String(record.observedAt) > String(records.get(record.threadId).observedAt))) records.set(record.threadId, record);
      } catch { unreadable++; }
    }
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
    limitations: ['Not subscription credits or money', 'Cached input is included in input; reasoning is included in output',
      'Local recent JSONL sessions only; remote/archived/unrecognised/multi-handoff chats excluded',
      'Bounded log windows may miss launch identity or usage; fork baselines excluded', 'Model is last observed, not per-model billing'],
    totalsByRole, sessions };
  for (const [file, value] of [['threads.json', bindings], ['cache.json', cache], ['summary.json', report]]) {
    const target = path.join(outputDir, file), pending = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(pending, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(pending, target);
  }
  const rows = Object.entries(totalsByRole).map(([role, u]) =>
    `| ${role} | ${u.sessions} | ${u.input_tokens - u.cached_input_tokens} | ${u.cached_input_tokens} | ${u.output_tokens} | ${u.total_tokens} |`);
  fs.writeFileSync(path.join(outputDir, 'summary.md'), [
    '# Local QA token usage', '', `Updated: ${report.generatedAt}. Recent session-start window: ${days} days.`, '',
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
