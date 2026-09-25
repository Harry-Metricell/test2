/**
 * Opens the configured V4 browser profile for a human to complete sign-in,
 * then replaces the private TEST2 storage-state file.  Tester tasks are
 * deliberately isolated, so logging in through an ordinary browser cannot
 * refresh the state they receive.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const authPath = process.env.TEST2_AUTH_STATE
  || path.join(process.env.LOCALAPPDATA || '', 'TEST2', 'auth', 'user.json');
const launcherUrl = process.env.TEST2_LAUNCHER_URL || 'https://o2intelligence-v4-dev.metricell.com/launcher';
const emailContinue = process.argv.includes('--email-continue');
const approvedEmail = 'harry.piper@metricell.com';

if (!authPath || !path.isAbsolute(authPath)) {
  throw new Error('TEST2 auth-state path could not be determined. Set TEST2_AUTH_STATE to an absolute user.json path.');
}

if (emailContinue && new URL(launcherUrl).origin !== 'https://o2intelligence-v4-dev.metricell.com') {
  throw new Error('Automatic email Continue is limited to the approved V4 development host.');
}

const browser = await chromium.launch({ headless: emailContinue });
const context = await browser.newContext(fs.existsSync(authPath) ? { storageState: authPath } : {});
const page = await context.newPage();
const prompt = readline.createInterface({ input, output });

try {
  await page.goto(launcherUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (emailContinue) {
    if (/authenticate|login|signin/i.test(page.url())) {
      await page.getByRole('textbox', { name: 'Email' }).fill(approvedEmail);
      await page.getByRole('button', { name: 'Continue' }).click();
    }
    await page.waitForURL(url => url.origin === 'https://o2intelligence-v4-dev.metricell.com' && url.pathname === '/launcher', { timeout: 30000 });
  } else {
    console.log('\nComplete the V4/Microsoft sign-in in the opened browser.');
    console.log('When the V4 launcher is visible, return here and press Enter. Nothing is saved until then.');
    await prompt.question('');
  }

  const currentUrl = page.url();
  if (/authenticate|login|signin|microsoftonline/i.test(currentUrl)) {
    throw new Error(`The browser is still on an authentication page (${currentUrl}). The existing private login was left unchanged.`);
  }

  fs.mkdirSync(path.dirname(authPath), { recursive: true });
  const pendingPath = `${authPath}.pending`;
  await context.storageState({ path: pendingPath });
  if (fs.existsSync(authPath)) fs.copyFileSync(authPath, `${authPath}.previous`);
  fs.renameSync(pendingPath, authPath);
  console.log(`Saved the authenticated TEST2 browser session to ${authPath}. Start a fresh tester task to use the updated state.`);
} finally {
  prompt.close();
  await browser.close();
}
