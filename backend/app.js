const express = require('express');
const cors = require('cors');
const catalog = require('./data/catalog.json'); // required (not read at runtime) so Vercel bundles it
const { searchCatalog } = require('./search');

const app = express();
app.use(cors());

// Optional fake delay so you can see the loading states: set LATENCY_MS=600
const LATENCY = Number(process.env.LATENCY_MS) || 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// GET /api/resources?search=&category=Design&category=Security&level=Advanced&minRating=4&sort=rating&page=1&limit=12
app.get('/api/resources', async (req, res) => {
  if (LATENCY) await sleep(LATENCY);
  res.json(searchCatalog(catalog, req.query));
});

// Full option lists for the filter checkboxes
app.get('/api/meta', (req, res) => {
  res.json({
    total: catalog.length,
    categories: [...new Set(catalog.map((i) => i.category))].sort(),
    levels: ['Beginner', 'Intermediate', 'Advanced'],
  });
});

app.get('/health', (req, res) => res.send('ok'));

module.exports = app;
