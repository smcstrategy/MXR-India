import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CheckCircle, AlertTriangle, Clock, Briefcase, Tag, ChevronDown } from 'lucide-react';
import ArchiveSection from './ArchiveSection';
import Link from 'next/link';
import './History.css';

interface DailyTask {
  id: number;
  task_date: string;
  employee_name: string;
  project_name: string;
  task_category: string;
  hours_spent: number | null;
  accomplishments: string;
  blockers: string | null;
  tomorrow_plan: string | null;
  priority: string;
  status: string;
}

async function getMonthlyArchives() {
  const { data, error } = await supabaseAdmin
    .from('monthly_archives')
    .select('*')
    .order('year_month', { ascending: false });
  if (error) { console.error(error.message); return []; }
  return data ?? [];
}

async function getHistoryTasks(): Promise<DailyTask[]> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  const yesterday     = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .gte('task_date', ninetyDaysAgo)
    .lte('task_date', yesterday)
    .order('task_date', { ascending: false })
    .order('employee_name', { ascending: true });

  if (error) { console.error(error.message); return []; }
  return data ?? [];
}

async function getProjectId(name: string): Promise<number | null> {
  const { data } = await supabase.from('projects').select('id').eq('name', name).maybeSingle();
  return data?.id ?? null;
}

function getPriorityClass(priority: string) {
  const map: Record<string, string> = {
    Low: 'priority-low', Medium: 'priority-medium',
    High: 'priority-high', Critical: 'priority-critical',
  };
  return map[priority] ?? 'priority-medium';
}

export default async function HistoryPage() {
  const [tasks, archives] = await Promise.all([getHistoryTasks(), getMonthlyArchives()]);

  // Resolve project IDs for links
  const projectNames = [...new Set(tasks.map(t => t.project_name))];
  const projectMap: Record<string, number | null> = {};
  for (const name of projectNames) {
    projectMap[name] = await getProjectId(name);
  }

  // All unique employees ever seen (used to calc missing per day)
  const allEmployees = [...new Set(tasks.map(t => t.employee_name))].sort();

  // Group by date
  const byDate = new Map<string, DailyTask[]>();
  for (const task of tasks) {
    if (!byDate.has(task.task_date)) byDate.set(task.task_date, []);
    byDate.get(task.task_date)!.push(task);
  }

  const dates = [...byDate.keys()]; // already sorted desc

  return (
    <div className="history-page">
      <div className="dashboard-header">
        <div>
          <h1 className="heading-xl">Work History</h1>
          <p className="subtitle text-secondary">Daily work status and submission tracking</p>
        </div>
      </div>

      <ArchiveSection archives={archives} />

      {dates.length === 0 ? (
        <div className="history-empty glass-panel">
          <p className="text-secondary">No history yet. Records will appear after the day ends.</p>
        </div>
      ) : (
        <div className="history-list">
          {dates.map(date => {
            const dayTasks    = byDate.get(date)!;
            const submitted   = new Set(dayTasks.map(t => t.employee_name));
            const missing     = allEmployees.filter(n => !submitted.has(n));
            const totalHours  = dayTasks.reduce((s, t) => s + (t.hours_spent ?? 0), 0);
            const dateLabel   = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
            });

            return (
              <details key={date} className="history-day glass-panel" open>
                <summary className="history-day-header">
                  <div className="history-day-left">
                    <span className="history-date">{dateLabel}</span>
                    <div className="history-day-badges">
                      <span className="hbadge hbadge-green">
                        <CheckCircle size={12} /> {dayTasks.length} submitted
                      </span>
                      {missing.length > 0 && (
                        <span className="hbadge hbadge-red">
                          <AlertTriangle size={12} /> {missing.length} not submitted
                        </span>
                      )}
                      <span className="hbadge hbadge-gray">
                        <Clock size={12} /> Total {totalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={18} className="history-chevron text-secondary" />
                </summary>

                <div className="history-day-body">
                  {/* 미제출 */}
                  {missing.length > 0 && (
                    <div className="history-missing">
                      <span className="history-section-label label-missing">
                        <AlertTriangle size={13} /> Not Submitted
                      </span>
                      <div className="history-missing-names">
                        {missing.map(name => (
                          <span key={name} className="missing-chip">
                            <span className="missing-chip-avatar">{name.charAt(0).toUpperCase()}</span>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 제출된 업무 카드 */}
                  <div className="history-cards">
                    {dayTasks.map(task => (
                      <div key={task.id} className="hcard">
                        <div className="hcard-header">
                          <div className="hcard-employee">
                            <div className="employee-avatar">
                              {task.employee_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="hcard-name">{task.employee_name}</span>
                              <span className="trc-project" style={{ marginTop: 4 }}>
                                <Briefcase size={10} />
                                {projectMap[task.project_name] ? (
                                  <Link href={`/projects/${projectMap[task.project_name]}`} className="hover-link">
                                    {task.project_name}
                                  </Link>
                                ) : (
                                  task.project_name
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="hcard-meta">
                            {task.hours_spent != null && (
                              <span className="hours-chip"><Clock size={12} />{task.hours_spent}h</span>
                            )}
                            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        <div className="hcard-body">
                          <div className="trc-section">
                            <span className="trc-label">Accomplishments</span>
                            <Link href={`/daily-tasks/${task.id}`} className="trc-text hover-card-link">
                              {task.accomplishments}
                            </Link>
                          </div>
                          {task.blockers && (
                            <div className="trc-section">
                              <span className="trc-label trc-label-danger">Issues / Blockers</span>
                              <p className="trc-text">{task.blockers}</p>
                            </div>
                          )}
                          {task.tomorrow_plan && (
                            <div className="trc-section">
                              <span className="trc-label">Tomorrow&apos;s Plan</span>
                              <p className="trc-text">{task.tomorrow_plan}</p>
                            </div>
                          )}
                        </div>

                        <div className="trc-footer">
                          <span className="category-tag">
                            <Tag size={11} />{task.task_category}
                          </span>
                          <span className={`status-badge status-${task.status.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
