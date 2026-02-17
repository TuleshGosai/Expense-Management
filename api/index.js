const path = require('path');
const jsonServer = require('json-server');

// db.json at project root (one level up from api/)
const dbPath = path.join(__dirname, '..', 'db.json');
const router = jsonServer.router(dbPath);

module.exports = function handler(req, res) {
  // Strip /api prefix so json-server sees /users, /expenses, etc.
  const originalUrl = req.url || '';
  req.url = originalUrl.replace(/^\/api/, '') || '/';

  jsonServer.bodyParser(req, res, () => {
    router(req, res, () => {
      if (!res.writableEnded) res.end();
    });
  });
};
