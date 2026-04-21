-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozmticxpqnnaqnjypmgg/sql

CREATE TABLE IF NOT EXISTS public.projects (
  id                 BIGSERIAL PRIMARY KEY,
  name               TEXT         NOT NULL,
  status             TEXT         NOT NULL DEFAULT 'active',
  -- 'active'  = 수행중 프로젝트
  -- 'sales'   = 영업단계 프로젝트
  client_name        TEXT,
  description        TEXT,
  start_date         DATE,
  expected_end_date  DATE,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_name   ON public.projects (name);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"   ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.projects FOR DELETE USING (true);
