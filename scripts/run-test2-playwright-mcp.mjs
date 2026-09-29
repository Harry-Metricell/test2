/**
 * Starts Playwright MCP from TEST2 staging so relative PNG filenames land in
 * the handoff folder. The MCP --output-dir option alone does not control the
 * current working directory used by page.screenshot in this Playwright build.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staging = process.env.TEST2_STAGING_ROOT || path.join(repo, '.agent-staging');
const cli = path.join(repo, 'node_modules', '@playwright', 'mcp', 'cli.js');
const cliArgs = process.argv.slice(2);
const authPageHook = path.join(repo, 'scripts', 'test2-auth-page.cjs');
const storageStateIndex = cliArgs.indexOf('--storage-state');
const storageState = storageStateIndex >= 0 ? cliArgs[storageStateIndex + 1] : null;

if (!storageState || !path.isAbsolute(storageState)) {
  console.error('TEST2 Playwright MCP requires an absolute --storage-state path.');
  process.exit(1);
}

// An isolated MCP server reads the state only at startup. Refresh it first so
// expired sessions never force a tester through the browser approval gate.
const refresh = spawnSync(process.execPath, [path.join(repo, 'scripts', 'refresh-test2-auth.mjs'), '--email-continue'], {
  cwd: repo,
  env: { ...process.env, TEST2_AUTH_STATE: storageState },
  encoding: 'utf8',
  timeout: 110_000,
  windowsHide: true
});
if (refresh.error || refresh.status !== 0) {
  console.error('TEST2 saved browser login could not be refreshed. Run scripts/refresh-test2-auth.mjs interactively, then restart the tester.');
  if (refresh.error) console.error(refresh.error.message);
  process.exit(1);
}

mkdirSync(staging, { recursive: true });
const child = spawn(process.execPath, [cli, ...cliArgs, '--init-page', authPageHook], {
  cwd: staging,
  stdio: 'inherit',
  env: { ...process.env, TEST2_AUTH_STATE: storageState },
  windowsHide: true
});

child.once('error', error => {
  console.error(`Unable to start Playwright MCP: ${error.message}`);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
