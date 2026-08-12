/* ============================================================
   SHAAM-E-GAZAL — server.js
   Lightweight Local HTTP Development Server
   Run: node server.js -> Open http://localhost:3000
   ============================================================ */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DIR  = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(DIR, path.normalize(urlPath));

  // Security check: prevent directory traversal
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1><p>Requested path: ' + urlPath + '</p>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n  🪔  Shaam-e-Gazal is live!');
  console.log('  ▶  Open in browser: http://localhost:' + PORT + '\n');
  exec('start http://localhost:' + PORT);
});
