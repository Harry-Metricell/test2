import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { documentXml, guideMarkerCounts } from './guide-document-index.mjs';

// Minimal ZIP fixture with the same local/central member layout as a DOCX.
function fixture(xml, method = 8) {
  const name = Buffer.from('word/document.xml');
  const raw = Buffer.from(xml);
  const body = method === 8 ? deflateRawSync(raw) : raw;
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(method, 8);
  local.writeUInt32LE(body.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50); central.writeUInt16LE(method, 10);
  central.writeUInt32LE(body.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(name.length, 28);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12); end.writeUInt32LE(local.length + name.length + body.length, 16);
  return Buffer.concat([local, name, body, central, name, end]);
}
const paragraph = text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;

test('reads stored and deflated Word XML and rejects damaged archives', () => {
  for (const method of [0, 8]) assert.equal(documentXml(fixture('<w:document/>', method)), '<w:document/>');
  for (const bytes of [Buffer.alloc(0), Buffer.from('not a DOCX'), fixture('xml').subarray(0, 40)]) assert.throws(() => documentXml(bytes));
});

test('counts split-run markers, duplicates and missing guide without inventing targets', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-marker-'));
  try {
    const file = path.join(root, 'guide.docx');
    assert.equal(guideMarkerCounts(file).size, 0);
    fs.writeFileSync(file, fixture(`<w:document>${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-31]]')}${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-31]]')}<w:p><w:r><w:t>[[AUTO_GUIDE_</w:t></w:r><w:r><w:t>UPDATE:TEST2-57]]</w:t></w:r></w:p></w:document>`));
    assert.deepEqual([...guideMarkerCounts(file)], [['TEST2-31', 2], ['TEST2-57', 1]]);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('bundler indexes only actual unique guide sections, including archived sources', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-index-'));
  const write = (relative, data) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
  try {
    write('config/user-guide-plan.json', JSON.stringify({ publishedGuide: 'assets/guide.docx' }));
    write('assets/guide.docx', fixture(`<w:document>${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-32]]')}${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-57]]')}${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-59]]')}${paragraph('[[AUTO_GUIDE_UPDATE:TEST2-59]]')}</w:document>`));
    for (const key of ['TEST2-31', 'TEST2-57', 'TEST2-59', 'TEST2-55']) write(`tickets/${key}/guide-update.json`, JSON.stringify({ title: key, affectedSection: key, supersedesTicket: key === 'TEST2-55' ? 'TEST2-32' : undefined }));
    write('archive/tickets/TEST2-32/guide-update.json', JSON.stringify({ title: 'Archived section', affectedSection: 'Existing guidance' }));
    execFileSync(process.execPath, [fileURLToPath(new URL('./generate-status.mjs', import.meta.url))], { cwd: root, encoding: 'utf8' });
    const index = JSON.parse(fs.readFileSync(path.join(root, 'status/guide-updates.json'), 'utf8'));
    assert.deepEqual(index.sections.map(s => s.ticket), ['TEST2-32', 'TEST2-57']);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
