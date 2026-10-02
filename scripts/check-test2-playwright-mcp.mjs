/** Check the real STDIO MCP handshake and (with --browser) its launcher PNG. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staging = path.join(repo, '.agent-staging');
const state = process.env.TEST2_AUTH_STATE || path.join(process.env.LOCALAPPDATA || os.homedir(), 'TEST2', 'auth', 'user.json');
fs.mkdirSync(path.join(staging, 'mcp-health'), { recursive: true });
const child = spawn(process.execPath, [path.join(repo, 'scripts/run-test2-playwright-mcp.mjs'), '--isolated', '--storage-state', state,
  '--output-dir', staging, '--viewport-size', '1440x900', '--timeout-action', '10000'], { cwd: staging, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
let sequence = 0, buffer = '';
const pending = new Map();
const timer = setTimeout(() => { console.error('TEST2 MCP health check timed out.'); child.kill(); process.exitCode = 1; }, 90000);
child.stdout.on('data', chunk => {
  buffer += chunk;
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    try {
      const message = JSON.parse(line), waiter = pending.get(message.id);
      if (waiter) { pending.delete(message.id); message.error ? waiter.reject(new Error('MCP request failed.')) : waiter.resolve(message.result); }
    } catch { /* Ignore non-protocol output without exposing browser/auth text. */ }
  }
});
child.stderr.on('data', () => {}); // OAuth redirects can include private state.
child.on('error', error => { for (const waiter of pending.values()) waiter.reject(error); });
child.on('exit', () => { for (const waiter of pending.values()) waiter.reject(new Error('MCP server exited before completing the health check.')); });
const send = (method, params) => new Promise((resolve, reject) => {
  const id = ++sequence; pending.set(id, { resolve, reject });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
});
try {
  await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test2-health', version: '1.0' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const { tools } = await send('tools/list', {});
  const required = ['browser_navigate', 'browser_snapshot', 'browser_take_screenshot'];
  if (!required.every(name => tools.some(tool => tool.name === name))) throw new Error('Required browser tools are absent.');
  if (process.argv.includes('--browser')) {
    const navigate = await send('tools/call', { name: 'browser_navigate', arguments: { url: 'https://o2intelligence-v4-dev.metricell.com/launcher' } });
    if (navigate.isError) throw new Error('Launcher navigation failed.');
    const ready = await send('tools/call', { name: 'browser_wait_for', arguments: { text: 'Launcher' } });
    if (ready.isError) throw new Error('The launcher did not finish loading.');
    const screenshot = await send('tools/call', { name: 'browser_take_screenshot', arguments: { type: 'png', scale: 'css', filename: 'mcp-health/launcher.png' } });
    if (screenshot.isError) throw new Error('Browser screenshot failed.');
    const file = path.join(staging, 'mcp-health/launcher.png');
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error('Browser did not save a non-empty PNG.');
    console.log(JSON.stringify({ toolsReady: true, browserNavigation: true, screenshot: file, screenshotBytes: fs.statSync(file).size }));
  } else console.log(JSON.stringify({ toolsReady: true, tools: required }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { clearTimeout(timer); child.stdin.end(); child.kill(); }
