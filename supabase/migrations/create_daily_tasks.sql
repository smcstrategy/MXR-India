-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozmticxpqnnaqnjypmgg/sql

CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id           BIGSERIAL PRIMARY KEY,
  task_date    DATE         NOT NULL,
  employee_name TEXT        NOT NULL,
  project_name TEXT         NOT NULL,
  task_category TEXT        NOT NULL DEFAULT 'General',
  hours_spent  NUMERIC(4, 1),
  accomplishments TEXT      NOT NULL,
  blockers     TEXT,
  tomorrow_plan TEXT,
  priority     TEXT         NOT NULL DEFAULT 'Medium',
  status       TEXT         NOT NULL DEFAULT 'Submitted',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date     ON public.daily_tasks (task_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_employee ON public.daily_tasks (employee_name);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status   ON public.daily_tasks (status);

-- Enable Row Level Security (keep it simple: allow all for anon key)
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: allow anyone with the anon key to read and write
CREATE POLICY "Allow public read"   ON public.daily_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.daily_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.daily_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.daily_tasks FOR DELETE USING (true);
