require('dotenv').config();
const app = require('./app');
const { startScheduler } = require('./services/scheduler');

const PORT = Number(process.env.PORT || 38080);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startScheduler();
});
