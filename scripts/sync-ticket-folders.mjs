import fs from 'node:fs';
import path from 'node:path';

const result = JSON.parse(fs.readFileSync('results.json', 'utf8'));
if (!result || !Array.isArray(result.issues) || result.isLast !== true) {
  throw new Error('Jira response is missing a complete issues list; refusing to sync');
}
const issues = result.issues;
const projectKey = process.env.JIRA_PROJECT_KEY || 'TEST2';
const archiveRoot = path.join('archive', 'tickets');

const active = new Set();
for (const issue of issues) {
  const key = String(issue.key || '');
  const jiraStatus = String(issue.fields?.status?.name || 'Unknown');
  if (!key.startsWith(`${projectKey}-`) || !/^\w+-\d+$/.test(key)) continue;
  if (jiraStatus.toLowerCase() === 'done') continue;
  active.add(key);
  const dir = path.join('tickets', key);
  const archivedDir = path.join(archiveRoot, key);
  if (!fs.existsSync(dir) && fs.existsSync(archivedDir)) {
    fs.mkdirSync('tickets', { recursive: true });
    fs.renameSync(archivedDir, dir);
    fs.rmSync(path.join(dir, 'archive.json'), { force: true });
    console.log(`Restored ${key}: present in Jira again`);
  } else if (fs.existsSync(dir) && fs.existsSync(archivedDir)) {
    throw new Error(`${key} exists in both active and archived folders; refusing to overwrite either copy`);
  }
  fs.mkdirSync(path.join(dir, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'screenshots', '.gitkeep'), '');
  fs.writeFileSync(path.join(dir, 'reports', '.gitkeep'), '');
  fs.writeFileSync(path.join(dir, 'ticket.json'), JSON.stringify(issue, null, 2) + '\n');
  const statusFile = path.join(dir, 'status.json');
  let existing = {};
  if (fs.existsSync(statusFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    } catch (error) {
      console.warn(`Ignoring malformed ${statusFile}; Jira status will be preserved and QA status reset`);
    }
  }
  // Jira is read-only: refresh only Jira-owned fields and preserve QA workflow
  // state, retries, and block metadata.
  const nextStatus = { ...existing, ticket: key, jiraStatus, qaStatus: existing.qaStatus || 'Not Tested', status: jiraStatus, retries: Number(existing.retries || 0), retryLimit: Number(existing.retryLimit || 3) };
  fs.writeFileSync(statusFile, JSON.stringify(nextStatus, null, 2) + '\n');
}

if (fs.existsSync('tickets')) {
  for (const entry of fs.readdirSync('tickets', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const key = entry.name;
    if (key.startsWith(`${projectKey}-`) && /^\w+-\d+$/.test(key) && !active.has(key)) {
      const source = path.join('tickets', key);
      const target = path.join(archiveRoot, key);
      if (fs.existsSync(target)) throw new Error(`${key} already has an archive; refusing to overwrite it`);
      fs.mkdirSync(archiveRoot, { recursive: true });
      fs.writeFileSync(path.join(source, 'archive.json'), JSON.stringify({
        ticket: key,
        archivedAt: new Date().toISOString(),
        reason: issues.some((issue) => issue.key === key) ? 'Jira Done' : 'Absent from complete Jira response'
      }, null, 2) + '\n');
      fs.renameSync(source, target);
      console.log(`Archived ${key}: done or absent from Jira`);
    }
  }
}

console.log(`Synced ${issues.length} Jira issues; active tickets: ${active.size}`);
