// File helpers shared by all scripts. Paths in manifests and messages are
// POSIX-style and relative to the repository root, so output is identical on
// macOS, Linux and Windows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const abs = (rel) => path.join(ROOT, ...rel.split('/'));
export const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// Text is always read as UTF-8 with LF line endings. A Windows checkout with
// core.autocrlf would otherwise change every byte offset.
export function readText(relPath) {
  return fs.readFileSync(abs(relPath), 'utf8').replace(/\r\n/g, '\n');
}

export function readJSON(relPath) {
  const text = readText(relPath);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${relPath}: invalid JSON (${e.message})`);
  }
}

export function exists(relPath) {
  return fs.existsSync(abs(relPath));
}

export function listFiles(relDir, ext) {
  if (!exists(relDir)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
      const child = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(child);
      else if (!ext || entry.name.endsWith(ext)) out.push(child);
    }
  };
  walk(relDir);
  return out.sort();
}

export function writeText(relPath, text) {
  fs.mkdirSync(path.dirname(abs(relPath)), { recursive: true });
  fs.writeFileSync(abs(relPath), text, 'utf8');
}

export function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}
