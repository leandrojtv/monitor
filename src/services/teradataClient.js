function random(min, max) {
  return Math.random() * (max - min) + min;
}

async function fetchTeradataMetrics() {
  const now = new Date();

  return {
    diskSpace: [
      { database_name: 'finance_dw', used_gb: Number(random(500, 900).toFixed(2)) },
      { database_name: 'sales_ods', used_gb: Number(random(200, 400).toFixed(2)) },
      { database_name: 'customer_360', used_gb: Number(random(300, 700).toFixed(2)) },
    ],
    sessions: {
      active_sessions: Math.floor(random(80, 250)),
      logins_count: Math.floor(random(50, 180)),
    },
    loginHistory: Array.from({ length: 5 }).map((_, i) => ({
      username: `user_${i + 1}`,
      source_ip: `10.0.0.${i + 10}`,
      login_time: now,
    })),
    highCpuQueries: [
      {
        query_hash: 'QH-101',
        query_text: 'SELECT * FROM large_fact_table WHERE dt >= CURRENT_DATE - 30',
        cpu_seconds: Number(random(120, 400).toFixed(2)),
        skew_percent: Number(random(15, 80).toFixed(2)),
      },
      {
        query_hash: 'QH-202',
        query_text: 'INSERT INTO agg_table SELECT ...',
        cpu_seconds: Number(random(80, 350).toFixed(2)),
        skew_percent: Number(random(10, 70).toFixed(2)),
      },
    ],
  };
}

module.exports = { fetchTeradataMetrics };
