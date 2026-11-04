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
  return { schema: 'test2-site-token-usage.v1', coverage: 'partial', includesCoordinator: false,
    measurementWindowDays: Number.isInteger(report.days) && report.days > 0 && report.days <= 90 ? report.days : 14,
    observedThrough, tickets: Object.fromEntries(Object.entries(tickets).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ticket]) => [key, { ...ticket, roles: Object.fromEntries(Object.entries(ticket.roles).sort(([a], [b]) => a.localeCompare(b))) }])) };
}
