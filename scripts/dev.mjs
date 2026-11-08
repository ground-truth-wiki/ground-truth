#!/usr/bin/env node
// Rebuilds on every change and serves dist/ at http://localhost:8080
// (set PORT to change it). Stop with Ctrl+C.
//
//   node scripts/dev.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, abs } from './lib/fsutil.mjs';

const PORT = Number(process.env.PORT) || 8080;
const WATCH = ['content', 'data', 'engine', 'build'];
const DIST = abs('dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function rebuild() {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) console.error('build failed; fix the error above and save again');
}

let timer = null;
const schedule = () => { clearTimeout(timer); timer = setTimeout(rebuild, 150); };
for (const dir of WATCH) fs.watch(abs(dir), { recursive: true }, schedule);
rebuild();

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (p === '/') p = '/ground-truth.html';
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, path.normalize(p));
  if (!file.startsWith(DIST + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
})
  .on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `port ${PORT} is busy; run with another, for example PORT=8081 npm run dev` : e.message); process.exit(1); })
  .listen(PORT, '127.0.0.1', () => console.log(`serving dist/ at http://localhost:${PORT} (rebuilds on change, Ctrl+C to stop)`));
