// Runs inside Playwright MCP's browser page, including after a mid-test redirect.
// Only the approved V4 development host and email/Continue step are automated.
const fs = require('node:fs');
const path = require('node:path');

const origin = 'https://o2intelligence-v4-dev.metricell.com';
const email = 'harry.piper@metricell.com';

function isApprovedAuthenticationUrl(raw) {
  try {
    const url = new URL(raw);
    return url.origin === origin && /(?:authenticate|login|signin)/i.test(url.pathname);
  } catch { return false; }
}

exports.isApprovedAuthenticationUrl = isApprovedAuthenticationUrl;
exports.default = async function attachAuthenticationRecovery({ page }) {
  let recovering = false;
  let attempts = 0;
  const recover = async () => {
    if (recovering || !isApprovedAuthenticationUrl(page.url())) return;
    if (++attempts > 2) {
      console.error('TEST2 authentication returned repeatedly; human sign-in is required.');
      return;
    }
    recovering = true;
    try {
      await page.getByRole('textbox', { name: 'Email' }).fill(email, { timeout: 15000 });
      await page.getByRole('button', { name: 'Continue' }).click({ timeout: 15000 });
      // An interrupted module can return to that module rather than launcher.
      // The tester will still restart the criterion from launcher afterwards.
      await page.waitForURL(url => url.origin === origin && !isApprovedAuthenticationUrl(url.href), { timeout: 30000 });
      const authPath = process.env.TEST2_AUTH_STATE;
      if (authPath && path.isAbsolute(authPath)) {
        const pending = `${authPath}.${process.pid}.pending`;
        try {
          await page.context().storageState({ path: pending });
          fs.renameSync(pending, authPath);
        } finally {
          if (fs.existsSync(pending)) fs.unlinkSync(pending);
        }
      }
      console.error('TEST2 login recovered in the active browser; restart the affected criterion from the launcher.');
    } catch {
      // Playwright navigation errors include full OAuth redirect URLs and
      // transient state parameters. Never write those to task logs.
      console.error('TEST2 in-session login recovery failed; human sign-in may be required.');
    } finally {
      recovering = false;
    }
  };
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame() && isApprovedAuthenticationUrl(frame.url())) void recover();
  });
  if (isApprovedAuthenticationUrl(page.url())) void recover();
};
