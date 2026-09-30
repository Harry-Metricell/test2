const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { default: attach, isApprovedAuthenticationUrl } = require('./test2-auth-page.cjs');

test('only the approved V4 development sign-in route is eligible', () => {
  assert.equal(isApprovedAuthenticationUrl('https://o2intelligence-v4-dev.metricell.com/authenticate'), true);
  assert.equal(isApprovedAuthenticationUrl('https://evil.example/authenticate'), false);
  assert.equal(isApprovedAuthenticationUrl('https://o2intelligence-v4-dev.metricell.com/launcher'), false);
});

test('mid-session redirect performs email Continue in the existing page', async () => {
  const page = new EventEmitter();
  let url = 'https://o2intelligence-v4-dev.metricell.com/launcher';
  const events = [];
  const main = { url: () => url };
  page.url = () => url;
  page.mainFrame = () => main;
  page.getByRole = (role, options) => ({
    fill: async value => { events.push(`${role}:${options.name}:${value}`); },
    click: async () => { events.push(`${role}:${options.name}:clicked`); url = 'https://o2intelligence-v4-dev.metricell.com/launcher'; }
  });
  page.waitForURL = async predicate => { assert.equal(predicate(new URL(url)), true); events.push('launcher'); };
  await attach({ page });
  url = 'https://o2intelligence-v4-dev.metricell.com/authenticate';
  page.emit('framenavigated', main);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(events, [
    'textbox:Email:harry.piper@metricell.com',
    'button:Continue:clicked',
    'launcher'
  ]);
});

test('OAuth navigation failure never logs its sensitive URL', async () => {
  const page = new EventEmitter();
  const frame = { url: () => 'https://o2intelligence-v4-dev.metricell.com/authenticate' };
  page.url = frame.url;
  page.mainFrame = () => frame;
  page.getByRole = () => ({
    fill: async () => {},
    click: async () => {}
  });
  page.waitForURL = async () => { throw new Error('https://login.microsoftonline.com/?state=secret-token'); };
  const messages = [];
  const original = console.error;
  console.error = message => messages.push(message);
  try {
    await attach({ page });
    await new Promise(resolve => setImmediate(resolve));
  } finally {
    console.error = original;
  }
  assert.equal(messages.length, 1);
  assert.match(messages[0], /human sign-in may be required/);
  assert.doesNotMatch(messages[0], /secret-token|login\.microsoftonline/);
});
