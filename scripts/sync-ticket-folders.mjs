import fs from 'node:fs';
import path from 'node:path';

const result = JSON.parse(fs.readFileSync('results.json', 'utf8'));
if (!result || !Array.isArray(result.issues) || result.isLast !== true) {
  throw new Error('Jira response is missing a complete issues list; refusing to sync');
}
const issues = result.issues;
const projectKey = process.env.JIRA_PROJECT_KEY || 'TEST2';

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
  const statusFile = path.join(dir, 'status.json');
  let existing = {};
  if (fs.existsSync(statusFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    } catch (error) {
      console.warn(`Ignoring malformed ${statusFile}; Jira status will be preserved and QA status reset`);
    }
  }
  fs.writeFileSync(statusFile, JSON.stringify({ ticket: key, jiraStatus, qaStatus: existing.qaStatus || 'Not Tested', status: jiraStatus }, null, 2) + '\n');
}

// This import is status-filtered; never delete folders absent from the filtered response.

console.log(`Synced ${issues.length} Jira issues; active tickets: ${active.size}`);
