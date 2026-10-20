// Read-only complete Jira snapshots plus paginated status history. Never write
// Jira, log credentials, or publish a partial response after an API failure.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function fetchJiraSnapshot({ base, project, authorization, request = fetch, root = '.' }) {
  base = base.replace(/\/$/, '');
  if (!/^https:\/\//.test(base) || !/^[A-Z][A-Z0-9_]*$/.test(project)) throw new Error('Invalid Jira URL/project');
  async function get(route, params) {
    const url = new URL(`${base}/rest/api/3/${route}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await request(url, { headers: { Accept: 'application/json', Authorization: authorization }, redirect: 'error', signal: AbortSignal.timeout(60000) });
      if (response.ok) return response.json();
      if (attempt < 3 && (response.status === 429 || response.status >= 500)) { await new Promise(resolve => setTimeout(resolve, Math.min(30000, 1000 * 2 ** attempt))); continue; }
      throw new Error(`Jira ${route}: HTTP ${response.status}`);
    }
  }
  const issues = [];
  let token;
  const tokens = new Set();
  do {
    const page = await get('search/jql', { jql: `project = ${project} ORDER BY updated DESC`, maxResults: 100,
      fields: 'summary,status,priority,assignee,parent,created,updated,description,subtasks,project', ...(token ? { nextPageToken: token } : {}) });
    if (!Array.isArray(page.issues) || typeof page.isLast !== 'boolean') throw new Error('Incomplete Jira search page');
    issues.push(...page.issues);
    if (page.isLast) break;
    token = page.nextPageToken;
    if (!token || tokens.has(token)) throw new Error('Jira search pagination did not advance');
    tokens.add(token);
  } while (true);
  if (new Set(issues.map(i => i.key)).size !== issues.length) throw new Error('Duplicate Jira issues in paginated import');
  for (const issue of issues) {
    if (!new RegExp(`^${project}-\\d+$`).test(issue.key || '')) throw new Error('Unexpected Jira issue key');
    // Done snapshots archive the existing ticket without resetting it. Fetch
    // their full history only if reopened, avoiding repeated archival reads.
    if (String(issue.fields?.status?.name).toLowerCase() === 'done') continue;
    let previous;
    for (const baseDir of ['tickets', 'archive/tickets']) {
      const file = path.join(root, baseDir, issue.key, 'ticket.json');
      if (fs.existsSync(file)) { previous = JSON.parse(fs.readFileSync(file, 'utf8')); break; }
    }
    if (previous?.fields?.updated === issue.fields?.updated && previous.qaStatusHistory?.complete === true) { issue.qaStatusHistory = previous.qaStatusHistory; continue; }
    const transitions = [];
    let startAt = 0;
    do {
      const page = await get(`issue/${issue.key}/changelog`, { startAt, maxResults: 100 });
      if (!Array.isArray(page.values) || !Number.isInteger(page.total) || page.startAt !== startAt || !page.values.length && startAt < page.total) throw new Error(`${issue.key}: incomplete changelog`);
      for (const entry of page.values) for (const [index, item] of (entry.items || []).entries()) if (item.fieldId === 'status' || item.field === 'status') transitions.push({ id: `${entry.id}:${index}`, at: entry.created, from: item.fromString || '', to: item.toString });
      startAt += page.values.length;
      if (startAt >= page.total) break;
    } while (true);
    transitions.sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id, undefined, { numeric: true }));
    // Do not consume a transition newer than the searched issue snapshot.
    // It belongs to the next import if Jira changed during pagination.
    const snapshotAt = Date.parse(issue.fields?.updated);
    if (!Number.isFinite(snapshotAt)) throw new Error(`${issue.key}: invalid snapshot timestamp`);
    issue.qaStatusHistory = { complete: true, transitions: transitions.filter(event => Date.parse(event.at) <= snapshotAt) };
  }
  return { issues, isLast: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) throw new Error('Jira read-only import credentials are not configured');
  const snapshot = await fetchJiraSnapshot({ base: JIRA_URL, project: JIRA_PROJECT_KEY || 'TEST2', authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}` });
  fs.writeFileSync('results.json', JSON.stringify(snapshot) + '\n');
  console.log(`Fetched ${snapshot.issues.length} issues with complete status history`);
}
