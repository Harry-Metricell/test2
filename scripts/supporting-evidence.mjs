// CSV/API/DOM proof remains private; only scoped references and hashes are published.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export function copySupportingEvidence(results, run, destination, prefix) {
  const pending = [], names = new Set();
  const root = fs.realpathSync(run);
  const amended = results.map((item, index) => {
    if (item.supportingEvidence === undefined) return item;
    if (!Array.isArray(item.supportingEvidence) || item.supportingEvidence.length > 8) throw Error('Invalid supporting evidence list');
    const supportingEvidence = item.supportingEvidence.map(ref => {
      const match = new RegExp(`^supporting/(criterion-${index + 1}-[a-z0-9-]+\\.(?:csv|json))$`).exec(ref?.path || '');
      if (!match || !/^[a-f0-9]{64}$/.test(ref.sha256 || '')
          || !['csv', 'api-response', 'dom-observation', 'verification'].includes(ref.kind)
          || typeof ref.description !== 'string' || !ref.description.trim() || ref.description.length > 500
          || names.has(match[1])) throw Error('Invalid criterion-owned supporting evidence');
      names.add(match[1]);
      const source = path.join(root, 'supporting', match[1]);
      if (fs.lstatSync(path.dirname(source)).isSymbolicLink() || fs.lstatSync(source).isSymbolicLink()) throw Error('Symlink supporting evidence is forbidden');
      const stat = fs.statSync(source);
      if (!stat.isFile() || stat.size < 1 || stat.size > 25 * 1024 * 1024) throw Error('Supporting evidence is empty or too large');
      const bytes = fs.readFileSync(source);
      if (digest(bytes) !== ref.sha256) throw Error('Supporting evidence hash mismatch');
      if (match[1].endsWith('.json')) JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
      const target = path.join(destination, match[1]);
      // Existing proof cannot silently change when a publisher retries a push.
      if (fs.existsSync(target) && (fs.lstatSync(target).isSymbolicLink() || digest(fs.readFileSync(target)) !== ref.sha256)) throw Error('Supporting evidence collision');
      pending.push({ target, bytes });
      return { path: prefix + match[1], sha256: ref.sha256, kind: ref.kind, description: ref.description };
    });
    return { ...item, supportingEvidence };
  });
  // Validate every reference before writing any new private artifact.
  if (pending.length) {
    fs.mkdirSync(destination, { recursive: true });
    if (fs.lstatSync(destination).isSymbolicLink()) throw Error('Symlink evidence destination is forbidden');
    for (const { target, bytes } of pending) if (!fs.existsSync(target)) fs.writeFileSync(target, bytes, { flag: 'wx' });
  }
  return amended;
}
