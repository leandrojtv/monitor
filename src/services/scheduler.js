const cron = require('node-cron');
const db = require('../db/client');
const { fetchTeradataMetrics } = require('./teradataClient');

function dayMatches(days) {
  const jsDay = new Date().getDay();
  const normalized = jsDay === 0 ? '7' : String(jsDay);
  return days.includes(normalized);
}

function hourMatches(hour) {
  return new Date().getHours() === hour;
}

function intervalMatches(lastCollectionAt, intervalDays) {
  if (!lastCollectionAt) return true;
  const last = new Date(lastCollectionAt);
  const now = new Date();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffDays >= intervalDays;
}

async function collectAndStoreMetrics() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM app_config WHERE id = 1');
    const config = rows[0];

    if (!config) {
      throw new Error('Configuração da aplicação não encontrada.');
    }

    if (
      !dayMatches(config.cron_days_of_week) ||
      !hourMatches(config.cron_hour) ||
      !intervalMatches(config.last_collection_at, config.cron_interval_days)
    ) {
      await client.query('ROLLBACK');
      return { skipped: true, reason: 'Fora da janela configurada.' };
    }

    const data = await fetchTeradataMetrics();

    for (const item of data.diskSpace) {
      await client.query(
        'INSERT INTO disk_space_metrics (database_name, used_gb) VALUES ($1, $2)',
        [item.database_name, item.used_gb]
      );
    }

    await client.query(
      'INSERT INTO session_metrics (active_sessions, logins_count) VALUES ($1, $2)',
      [data.sessions.active_sessions, data.sessions.logins_count]
    );

    for (const login of data.loginHistory) {
      await client.query(
        'INSERT INTO login_history (username, source_ip, login_time) VALUES ($1, $2, $3)',
        [login.username, login.source_ip, login.login_time]
      );
    }

    for (const query of data.highCpuQueries) {
      await client.query(
        `INSERT INTO high_cpu_queries (query_hash, query_text, cpu_seconds, skew_percent)
         VALUES ($1, $2, $3, $4)`,
        [query.query_hash, query.query_text, query.cpu_seconds, query.skew_percent]
      );
    }

    await client.query('UPDATE app_config SET last_collection_at = NOW(), updated_at = NOW() WHERE id = 1');

    await client.query('COMMIT');
    return { skipped: false };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function startScheduler() {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await collectAndStoreMetrics();
      if (result.skipped) {
        console.log(`Coleta ignorada: ${result.reason}`);
      } else {
        console.log('Coleta de métricas concluída.');
      }
    } catch (error) {
      console.error('Falha na coleta de métricas:', error.message);
    }
  });

  console.log('Scheduler iniciado. Verificação executa a cada hora cheia.');
}

module.exports = { startScheduler, collectAndStoreMetrics };
