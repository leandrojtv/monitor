const express = require('express');
const db = require('../db/client');

const router = express.Router();

function capacityFactor(databaseName) {
  if (databaseName.includes('archive')) return 8;
  if (databaseName.includes('ods')) return 2.5;
  if (databaseName.includes('finance')) return 1.6;
  return 1.8;
}

router.get('/dashboard', async (_req, res, next) => {
  try {
    const diskRes = await db.query(
      `SELECT DISTINCT ON (database_name)
          database_name,
          used_gb,
          collected_at
       FROM disk_space_metrics
       ORDER BY database_name, collected_at DESC`
    );

    const latestSessionRes = await db.query(
      `SELECT active_sessions, collected_at
       FROM session_metrics
       ORDER BY collected_at DESC
       LIMIT 1`
    );

    const skewRes = await db.query(
      `SELECT table_name, MAX(skew_percent) AS skew_factor
       FROM high_cpu_queries
       GROUP BY table_name
       ORDER BY skew_factor DESC
       LIMIT 5`
    );

    const cpuRes = await db.query(
      `SELECT user_name, amp_cpu_time, query_text, collected_at
       FROM high_cpu_queries
       WHERE amp_cpu_time > 100
       ORDER BY amp_cpu_time DESC
       LIMIT 20`
    );

    const logonPatternRes = await db.query(
      `SELECT EXTRACT(HOUR FROM login_time)::int AS hour,
              COUNT(*)::int AS logons,
              COUNT(*) FILTER (WHERE username ILIKE 'failed_%')::int AS brute_force_attempts
       FROM login_history
       WHERE login_time >= NOW() - INTERVAL '24 HOURS'
       GROUP BY EXTRACT(HOUR FROM login_time)
       ORDER BY hour`
    );

    const storageByDatabase = diskRes.rows.map((row) => {
      const used = Number(row.used_gb);
      const allocated = Number((used * capacityFactor(row.database_name)).toFixed(2));
      const percentualUsado = Number(((used / allocated) * 100).toFixed(2));

      return {
        database_name: row.database_name,
        currentPermGB: allocated,
        usedGB: used,
        percentualUsado,
        wastedGB: Number((allocated - used).toFixed(2)),
      };
    });

    const totalUsed = storageByDatabase.reduce((acc, item) => acc + item.usedGB, 0);
    const totalAllocated = storageByDatabase.reduce((acc, item) => acc + item.currentPermGB, 0);

    const subutilizadas = storageByDatabase
      .filter((item) => item.currentPermGB > 100 && item.percentualUsado < 20)
      .sort((a, b) => b.wastedGB - a.wastedGB);

    const sessions = latestSessionRes.rows[0]?.active_sessions || 0;
    const lastUpdated = [
      latestSessionRes.rows[0]?.collected_at,
      ...diskRes.rows.map((r) => r.collected_at),
      ...cpuRes.rows.map((r) => r.collected_at),
    ]
      .filter(Boolean)
      .sort()
      .pop();

    res.json({
      kpis: {
        totalSpaceUsedGB: Number(totalUsed.toFixed(2)),
        totalSpaceAvailableGB: Number((totalAllocated - totalUsed).toFixed(2)),
        totalSessoesAtivas: sessions,
      },
      armazenamento: storageByDatabase,
      desperdicio: subutilizadas,
      skewTop5: skewRes.rows.map((row) => ({
        table_name: row.table_name,
        skew_factor: Number(row.skew_factor),
      })),
      segurancaLogonsPorHora: logonPatternRes.rows,
      cpuHeavyQueries: cpuRes.rows.map((row) => ({
        user_name: row.user_name,
        cpu_seconds: Number(row.amp_cpu_time),
        sql_resume: row.query_text.slice(0, 120),
      })),
      lastUpdated: lastUpdated || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/disk-space', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);
    const { rows } = await db.query(
      `SELECT * FROM disk_space_metrics
       ORDER BY collected_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);
    const sessions = await db.query(
      `SELECT * FROM session_metrics
       ORDER BY collected_at DESC
       LIMIT $1`,
      [limit]
    );

    const logins = await db.query(
      `SELECT * FROM login_history
       ORDER BY login_time DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      session_history: sessions.rows,
      login_history: logins.rows,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/high-cpu-queries', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);
    const { rows } = await db.query(
      `SELECT * FROM high_cpu_queries
       ORDER BY collected_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
