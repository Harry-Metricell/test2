import fs from 'node:fs';
import path from 'node:path';

const result = JSON.parse(fs.readFileSync('results.json', 'utf8'));
const confirmation = JSON.parse(fs.readFileSync('results-confirm.json', 'utf8'));
const issues = result.issues || [];
const confirmedIssues = confirmation.issues || [];
const signature = (items) => JSON.stringify(items.map((issue) => [issue.key, issue.fields?.status?.name]).sort());
if (signature(issues) !== signature(confirmedIssues)) throw new Error('Jira project reads differ; refusing deletion');
const projectKey = process.env.JIRA_PROJECT_KEY || 'TEST2';
if (result.isLast !== true || confirmation.isLast !== true) throw new Error('Jira response is not confirmed complete; refusing deletion');

const active = new Set();
for (const issue of issues) {
  const key = String(issue.key || '');
  const jiraStatus = String(issue.fields?.status?.name || 'Unknown');
  if (!key.startsWith(`${projectKey}-`) || !/^\w+-\d+$/.test(key)) continue;
  if (jiraStatus.toLowerCase() === 'done') continue;
  active.add(key);
  const dir = path.join('tickets', key);
  fs.mkdirSync(path.join(dir, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'screenshots', '.gitkeep'), '');
  fs.writeFileSync(path.join(dir, 'reports', '.gitkeep'), '');
  fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify(issue, null, 2) + '\\n');
  fs.writeFileSync(path.join(dir, 'status.json'), JSON.stringify({ ticket: key, status: jiraStatus }, null, 2) + '\\n');
}

if (fs.existsSync('tickets')) {
  for (const entry of fs.readdirSync('tickets', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const key = entry.name;
    if (key.startsWith(`${projectKey}-`) && /^\w+-\d+$/.test(key) && !active.has(key)) {
      fs.rmSync(path.join('tickets', key), { recursive: true, force: true });
      console.log(`Removed ${key}: deleted from Jira or Done`);
    }
  }
}
console.log(`Synced ${issues.length} Jira issues; active tickets: ${active.size}`);
