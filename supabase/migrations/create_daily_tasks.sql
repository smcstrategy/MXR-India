-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozmticxpqnnaqnjypmgg/sql

CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID         REFERENCES auth.users(id) DEFAULT auth.uid(),
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
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id  ON public.daily_tasks (user_id);

-- Enable Row Level Security
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: allow anyone to read (for the dashboard)
CREATE POLICY "Allow public read" ON public.daily_tasks FOR SELECT USING (true);

-- Policy: allow authenticated users to insert their own tasks
CREATE POLICY "Allow auth insert" ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: allow owners or admins to update
CREATE POLICY "Allow owner or admin update" ON public.daily_tasks FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: allow owners or admins to delete
CREATE POLICY "Allow owner or admin delete" ON public.daily_tasks FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
