CREATE TABLE IF NOT EXISTS sensor_readings (
  id         UUID PRIMARY KEY,
  distance   DOUBLE PRECISION NOT NULL,
  angle      DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit       VARCHAR(10) NOT NULL DEFAULT 'cm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_log (
  id          UUID PRIMARY KEY,
  reading_id  UUID NOT NULL REFERENCES sensor_readings(id) ON DELETE CASCADE,
  phone_to    VARCHAR(30) NOT NULL DEFAULT '',
  message     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  sid         VARCHAR(64),
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
