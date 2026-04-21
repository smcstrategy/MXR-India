CREATE TABLE IF NOT EXISTS monthly_archives (
  id           SERIAL PRIMARY KEY,
  year_month   VARCHAR(7) NOT NULL UNIQUE,  -- e.g. "2026-03"
  tasks_data   JSONB      NOT NULL DEFAULT '[]',
  task_count   INTEGER    NOT NULL DEFAULT 0,
  employee_count INTEGER  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE monthly_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read on monthly_archives"
  ON monthly_archives FOR SELECT TO authenticated USING (true);
