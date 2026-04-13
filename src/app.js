const express = require('express');
const configRoutes = require('./routes/configRoutes');
const metricRoutes = require('./routes/metricRoutes');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/config', configRoutes);
app.use('/api/metrics', metricRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno no servidor.' });
});

module.exports = app;
