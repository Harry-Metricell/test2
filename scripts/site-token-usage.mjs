// Explicit public allowlist: never copy the private summary wholesale to GitHub.
const roles = new Set(['criteria-conversion', 'qa-testing', 'evidence-review', 'user-guide-impact', 'user-guide-authoring']);
const fields = ['input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_output_tokens', 'total_tokens'];

export function siteTokenUsage(report) {
  if (report?.schema !== 'test2-local-token-usage.v1' || !Array.isArray(report.sessions)) throw new Error('Invalid private usage summary');
  const tickets = {}, seen = new Set(); let observedThrough = null;
  for (const record of report.sessions) {
    if (!/^[a-f0-9-]{36}$/.test(record.threadId || '') || seen.has(record.threadId)) continue;
    if (!/^TEST2-\d+$/.test(record.ticket || '') || !roles.has(record.role)
        || !record.handoffId?.startsWith(`handoff-${record.ticket}-`)) continue;
    seen.add(record.threadId);
    const ticket = tickets[record.ticket] ||= { measuredChats: 0, unavailableChats: 0, roles: {} };
    const role = ticket.roles[record.role] ||= { measuredChats: 0, unavailableChats: 0, ...Object.fromEntries(fields.map(k => [k, 0])) };
    const u = record.usage;
    if (record.status === 'measured' && fields.every(k => Number.isSafeInteger(u?.[k]) && u[k] >= 0)
        && u.cached_input_tokens <= u.input_tokens && u.reasoning_output_tokens <= u.output_tokens) {
      ticket.measuredChats++; role.measuredChats++;
      for (const key of fields) role[key] += u[key];
    } else { ticket.unavailableChats++; role.unavailableChats++; }
    if (typeof record.observedAt === 'string' && /^\d{4}-\d\d-\d\dT/.test(record.observedAt) && Number.isFinite(Date.parse(record.observedAt))) {
      const time = new Date(record.observedAt).toISOString();
      if (!observedThrough || time > observedThrough) observedThrough = time;
    }
  }
  const at = Date.parse(report.generatedAt);
  // Hourly heartbeat bounds idle commits; counters still update on the normal
  // fifteen-minute publication check. This is an hour, not a precise scan time.
  const collectionCheckedHour = Number.isFinite(at) ? new Date(Math.floor(at / 3600000) * 3600000).toISOString() : null;
  return { schema: 'test2-site-token-usage.v1', coverage: 'partial', includesCoordinator: false,
    aggregation: report.aggregation === 'retained_measured_history' ? 'retained_measured_history' : 'recent_session_starts',
    collectionCheckedHour,
    collectionStatus: report.sourceAvailable === false ? 'source_unavailable'
      : report.unreadableFiles > 0 ? 'partial_source_access'
      : Object.keys(tickets).length ? 'partial_measurements' : 'no_attributable_workers',
    measurementWindowDays: Number.isInteger(report.days) && report.days > 0 && report.days <= 90 ? report.days : 14,
    observedThrough, tickets: Object.fromEntries(Object.entries(tickets).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ticket]) => [key, { ...ticket, roles: Object.fromEntries(Object.entries(ticket.roles).sort(([a], [b]) => a.localeCompare(b))) }])) };
}

function sanitizedTickets(value) {
  const clean = {};
  for (const [ticket, data] of Object.entries(value || {})) {
    if (!/^TEST2-\d+$/.test(ticket) || !data?.roles) continue;
    const selected = {};
    for (const [role, row] of Object.entries(data.roles)) {
      if (!roles.has(role) || !row || !['measuredChats', 'unavailableChats', ...fields].every(k => Number.isSafeInteger(row[k]) && row[k] >= 0)
        || row.cached_input_tokens > row.input_tokens || row.reasoning_output_tokens > row.output_tokens) continue;
      selected[role] = Object.fromEntries(['measuredChats', 'unavailableChats', ...fields].map(k => [k, row[k]]));
    }
    if (!Object.keys(selected).length) continue;
    clean[ticket] = { measuredChats: Object.values(selected).reduce((n,r) => n+r.measuredChats,0),
      unavailableChats: Object.values(selected).reduce((n,r) => n+r.unavailableChats,0), roles: selected };
  }
  return clean;
}

// Older published aggregates have no worker IDs. Preserve them separately,
// never add them to the new ledger: their overlap cannot be proved.
export function retainPublishedUsage(current, previous) {
  if (previous?.schema !== 'test2-site-token-usage.v1') return current;
  const old = { ...(previous.aggregation === 'retained_measured_history' ? previous.historicalTickets : previous.tickets) };
  if (previous.aggregation === 'retained_measured_history') {
    for (const [key, ticket] of Object.entries(previous.tickets || {})) {
      const next = current.tickets?.[key];
      if (!next || Object.entries(ticket.roles || {}).some(([role,row]) => !next.roles?.[role]
        || next.roles[role].measuredChats < row.measuredChats || next.roles[role].total_tokens < row.total_tokens)) old[key] ||= ticket;
    }
  }
  const historicalTickets = sanitizedTickets(old);
  const through = previous.historicalObservedThrough || previous.observedThrough;
  const historicalObservedThrough = typeof through === 'string' && /^\d{4}-\d\d-\d\dT/.test(through)
    && Number.isFinite(Date.parse(through)) ? new Date(through).toISOString() : null;
  return { ...current, ...(Object.keys(historicalTickets).length ? {
    historicalTickets,
    historicalObservedThrough
  } : {}) };
}
