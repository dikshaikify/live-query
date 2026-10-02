const fs = require('fs');
const path = require('path');
const express = require('express');
const app = require('./app');

// Production: serve the built React app from the same server (one deployed URL)
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Live Query Filter System on :${port}`));
