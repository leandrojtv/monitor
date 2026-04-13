function random(min, max) {
  return Math.random() * (max - min) + min;
}

async function fetchTeradataMetrics() {
  const now = new Date();

  return {
    diskSpace: [
      { database_name: 'finance_dw', used_gb: Number(random(500, 900).toFixed(2)) },
      { database_name: 'sales_ods', used_gb: Number(random(120, 350).toFixed(2)) },
      { database_name: 'customer_360', used_gb: Number(random(300, 700).toFixed(2)) },
      { database_name: 'archive_cold', used_gb: Number(random(15, 80).toFixed(2)) },
    ],
    sessions: {
      active_sessions: Math.floor(random(80, 250)),
      logins_count: Math.floor(random(50, 180)),
    },
    loginHistory: Array.from({ length: 8 }).map((_, i) => ({
      username: i % 3 === 0 ? `failed_login_${i}` : `user_${i + 1}`,
      source_ip: `10.0.0.${i + 10}`,
      login_time: new Date(now.getTime() - random(0, 24) * 60 * 60 * 1000),
    })),
    highCpuQueries: [
      {
        query_hash: 'QH-101',
        user_name: 'bi_analyst',
        table_name: 'large_fact_table',
        query_text: 'SELECT * FROM large_fact_table WHERE dt >= CURRENT_DATE - 30',
        cpu_seconds: Number(random(120, 400).toFixed(2)),
        amp_cpu_time: Number(random(120, 400).toFixed(2)),
        skew_percent: Number(random(15, 80).toFixed(2)),
      },
      {
        query_hash: 'QH-202',
        user_name: 'etl_service',
        table_name: 'agg_table',
        query_text: 'INSERT INTO agg_table SELECT ...',
        cpu_seconds: Number(random(80, 350).toFixed(2)),
        amp_cpu_time: Number(random(80, 350).toFixed(2)),
        skew_percent: Number(random(10, 70).toFixed(2)),
      },
      {
        query_hash: 'QH-303',
        user_name: 'risk_team',
        table_name: 'customer_risk_score',
        query_text: 'MERGE INTO customer_risk_score USING ...',
        cpu_seconds: Number(random(140, 420).toFixed(2)),
        amp_cpu_time: Number(random(140, 420).toFixed(2)),
        skew_percent: Number(random(25, 85).toFixed(2)),
      },
    ],
  };
}

module.exports = { fetchTeradataMetrics };
