import fs from 'node:fs';
import { inflateRawSync } from 'node:zlib';

// Read only the main XML member of a standard DOCX ZIP. No Office/Python or
// third-party packages are required by the status bundler. Unsupported or
// damaged archives fail closed rather than advertising invalid amendment IDs.
export function documentXml(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { end = i; break; }
  }
  if (end < 0 || bytes.readUInt16LE(end + 4) || bytes.readUInt16LE(end + 6)) throw new Error('Invalid or multi-disk guide DOCX');
  const count = bytes.readUInt16LE(end + 10);
  let cursor = bytes.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || bytes.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Invalid guide ZIP directory');
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const next = cursor + 46 + nameLength + bytes.readUInt16LE(cursor + 30) + bytes.readUInt16LE(cursor + 32);
    if (next > end) throw new Error('Truncated guide ZIP directory');
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    if (name === 'word/document.xml') {
      const offset = bytes.readUInt32LE(cursor + 42);
      const size = bytes.readUInt32LE(cursor + 20);
      const expectedSize = bytes.readUInt32LE(cursor + 24);
      if (offset + 30 > cursor || bytes.readUInt32LE(offset) !== 0x04034b50 || bytes.readUInt16LE(cursor + 8) & 1) throw new Error('Invalid guide XML member');
      const start = offset + 30 + bytes.readUInt16LE(offset + 26) + bytes.readUInt16LE(offset + 28);
      if (start + size > cursor || expectedSize > 32 * 1024 * 1024) throw new Error('Invalid guide XML size');
      const compressed = bytes.subarray(start, start + size);
      const method = bytes.readUInt16LE(cursor + 10);
      const xml = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed, { maxOutputLength: 32 * 1024 * 1024 }) : null;
      if (!xml || xml.length !== expectedSize) throw new Error('Unsupported or damaged guide XML');
      return xml.toString('utf8');
    }
    cursor = next;
  }
  throw new Error('Guide DOCX has no document.xml');
}

export function guideMarkerCounts(file) {
  const counts = new Map();
  if (!fs.existsSync(file)) return counts;
  const xml = documentXml(fs.readFileSync(file));
  // Markers can span Word runs. Reassemble text within each paragraph, never
  // across paragraphs. This mirrors the guide builder's paragraph matching.
  for (const paragraph of xml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)) {
    const text = [...paragraph[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('');
    for (const marker of text.matchAll(/\[\[AUTO_GUIDE_UPDATE:(TEST2-\d+)\]\]/g)) counts.set(marker[1], (counts.get(marker[1]) || 0) + 1);
  }
  return counts;
}
