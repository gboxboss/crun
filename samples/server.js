// Minimal static server for www/ and build/ (scene timing + audio cues).
const http = require('http');
const fs = require('fs');
const path = require('path');

const roots = { '/build/': path.join(__dirname, 'build'), '/': path.join(__dirname, 'www') };
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.geojson': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.jpg': 'image/jpeg',
};
const port = +process.argv[2] || 8090;

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const prefix = url.startsWith('/build/') ? '/build/' : '/';
  const root = roots[prefix];
  const p = path.join(root, url.slice(prefix.length));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, buf) => {
    if (err && url.startsWith('/assets/dem/')) { // elevation tile outside the downloaded areas: sea level
      buf = fs.readFileSync(path.join(roots['/'], 'assets/dem/flat.png')); err = null;
    }
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
    res.end(buf);
  });
}).listen(port, '127.0.0.1', () => console.log('listening ' + port));
