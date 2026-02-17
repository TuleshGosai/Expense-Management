const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');

// Resolve db.json: Vercel may place it in different locations (includeFiles / repo root)
function getDbPath() {
  const candidates = [
    path.join(__dirname, '..', 'db.json'),
    path.join(__dirname, 'db.json'),
    path.join(process.cwd(), 'db.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0]; // fallback so router doesn't throw on init
}

// Router: use file if it exists (Vercel includeFiles or repo), else in-memory so we don't 500
const dbPath = getDbPath();
let router;
if (fs.existsSync(dbPath)) {
  router = jsonServer.router(dbPath);
} else {
  const fallbackDb = { users: [], friends: [], expenses: [], groups: [] };
  router = jsonServer.router(fallbackDb);
}

module.exports = function handler(req, res) {
  try {
    // Strip /api prefix so json-server sees /users, /expenses, etc. Keep query string.
    const originalUrl = req.url || '';
    const [pathOnly, queryOnly] = originalUrl.split('?');
    const pathWithoutApi = pathOnly.replace(/^\/api/, '') || '/';
    req.url = queryOnly ? `${pathWithoutApi}?${queryOnly}` : pathWithoutApi;

    jsonServer.bodyParser(req, res, () => {
      router(req, res, () => {
        if (!res.writableEnded) res.end();
      });
    });
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Internal Server Error', error: err.message }));
  }
};
