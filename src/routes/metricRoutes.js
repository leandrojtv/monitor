const express = require('express');
const db = require('../db/client');

const router = express.Router();

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
