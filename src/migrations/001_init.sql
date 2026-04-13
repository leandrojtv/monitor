CREATE TABLE IF NOT EXISTS app_config (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  jdbc_connection_string TEXT NOT NULL,
  jdbc_user TEXT NOT NULL,
  jdbc_password TEXT NOT NULL,
  cron_interval_days INTEGER NOT NULL DEFAULT 1,
  cron_days_of_week TEXT[] NOT NULL DEFAULT ARRAY['1','2','3','4','5'],
  cron_hour SMALLINT NOT NULL DEFAULT 2,
  dashboard_refresh_rate_seconds INTEGER NOT NULL DEFAULT 60,
  last_collection_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_config_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS disk_space_metrics (
  id BIGSERIAL PRIMARY KEY,
  database_name TEXT NOT NULL,
  used_gb NUMERIC(12,2) NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_metrics (
  id BIGSERIAL PRIMARY KEY,
  active_sessions INTEGER NOT NULL,
  logins_count INTEGER NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_history (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  source_ip INET,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS high_cpu_queries (
  id BIGSERIAL PRIMARY KEY,
  query_hash TEXT NOT NULL,
  query_text TEXT NOT NULL,
  cpu_seconds NUMERIC(12,2) NOT NULL,
  skew_percent NUMERIC(5,2) NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_config (
  id,
  jdbc_connection_string,
  jdbc_user,
  jdbc_password,
  cron_interval_days,
  cron_days_of_week,
  cron_hour,
  dashboard_refresh_rate_seconds
)
VALUES (
  1,
  'jdbc:teradata://td.example.com/database=dbc',
  'teradata_user',
  'teradata_password',
  1,
  ARRAY['1','2','3','4','5'],
  2,
  60
)
ON CONFLICT (id) DO NOTHING;
