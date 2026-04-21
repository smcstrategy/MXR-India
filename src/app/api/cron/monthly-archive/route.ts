import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allow overriding year_month via query param (for manual triggers)
  const paramMonth = req.nextUrl.searchParams.get('month');
  const yearMonth  = paramMonth ?? getPreviousYearMonth();

  // Check if already archived
  const { data: existing } = await supabaseAdmin
    .from('monthly_archives')
    .select('id')
    .eq('year_month', yearMonth)
    .single();

  if (existing) {
    return NextResponse.json({ message: `Already archived: ${yearMonth}` });
  }

  // Fetch all tasks for that month
  const from = `${yearMonth}-01`;
  const to   = getLastDayOfMonth(yearMonth);

  const { data: tasks, error } = await supabaseAdmin
    .from('daily_tasks')
    .select('*')
    .gte('task_date', from)
    .lte('task_date', to)
    .order('task_date', { ascending: true })
    .order('employee_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ message: `No tasks found for ${yearMonth}, skipping.` });
  }

  const uniqueEmployees = new Set(tasks.map((t: { employee_name: string }) => t.employee_name));

  const { error: insertError } = await supabaseAdmin
    .from('monthly_archives')
    .insert({
      year_month:      yearMonth,
      tasks_data:      tasks,
      task_count:      tasks.length,
      employee_count:  uniqueEmployees.size,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message:   `Archived ${yearMonth}`,
    tasks:     tasks.length,
    employees: uniqueEmployees.size,
  });
}

function getPreviousYearMonth(): string {
  const now = new Date();
  const d   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getLastDayOfMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const last   = new Date(y, m, 0); // day 0 = last day of previous month
  return `${y}-${String(m).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}
