const express = require('express');
const db = require('../db/client');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM app_config WHERE id = 1');
    res.json(rows[0] || null);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      jdbc_connection_string,
      jdbc_user,
      jdbc_password,
      cron_interval_days,
      cron_days_of_week,
      cron_hour,
      cron_minute,
      dashboard_refresh_rate_seconds,
    } = req.body;

    const { rows } = await db.query(
      `UPDATE app_config
       SET jdbc_connection_string = COALESCE($1, jdbc_connection_string),
           jdbc_user = COALESCE($2, jdbc_user),
           jdbc_password = COALESCE($3, jdbc_password),
           cron_interval_days = COALESCE($4, cron_interval_days),
           cron_days_of_week = COALESCE($5, cron_days_of_week),
           cron_hour = COALESCE($6, cron_hour),
           cron_minute = COALESCE($7, cron_minute),
           dashboard_refresh_rate_seconds = COALESCE($8, dashboard_refresh_rate_seconds),
           updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        jdbc_connection_string,
        jdbc_user,
        jdbc_password,
        cron_interval_days,
        cron_days_of_week,
        cron_hour,
        cron_minute,
        dashboard_refresh_rate_seconds,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
