// Simple local dev server for Shaam-e-Gazal
// Run: node server.js  →  open http://localhost:3000

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const DIR  = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown',
};

const server = http.createServer(function(req, res) {
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  // Strip query strings
  urlPath = urlPath.split('?')[0];

  const filePath = path.join(DIR, urlPath);
  const ext      = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, function() {
  console.log('');
  console.log('  \uD83E\uDE94  Shaam-e-Gazal is live!');
  console.log('');
  console.log('  \u25B6  Open in browser:  http://localhost:' + PORT);
  console.log('');
  console.log('  Press Ctrl+C to stop the server.');
  console.log('');

  // Try to auto-open browser on Windows
  const { exec } = require('child_process');
  exec('start http://localhost:' + PORT);
});
