import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Calendar, Clock, Tag, AlertTriangle, ClipboardList } from 'lucide-react';
import './Reports.css';

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

async function getAllTasks(): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .order('task_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('Failed to fetch tasks:', error.message);
    return [];
  }
  return data ?? [];
}

function formatDateLabel(dateStr: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getPriorityClass(priority: string) {
  const map: Record<string, string> = {
    Low: 'priority-low',
    Medium: 'priority-medium',
    High: 'priority-high',
    Critical: 'priority-critical',
  };
  return map[priority] ?? 'priority-medium';
}

export default async function ReportsPage() {
  const tasks = await getAllTasks();

  const grouped = tasks.reduce<Record<string, DailyTask[]>>((acc, t) => {
    (acc[t.task_date] ??= []).push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <div>
          <h1 className="heading-xl">Daily Reports</h1>
          <p className="subtitle text-secondary">All employee daily work reports.</p>
        </div>
        <Link href="/daily-tasks/new" className="btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>Submit Today&apos;s Report</span>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="reports-empty glass-panel">
          <ClipboardList size={48} className="text-secondary reports-empty-icon" />
          <p className="heading-lg" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            No reports yet
          </p>
          <p className="text-secondary" style={{ marginTop: 8 }}>
            Click <strong>Submit Today&apos;s Report</strong> to get started.
          </p>
        </div>
      ) : (
        <div className="reports-timeline">
          {sortedDates.map((date) => (
            <div key={date} className="date-section">
              <div className="date-section-header">
                <div className="date-pill">
                  <Calendar size={14} />
                  <span>{formatDateLabel(date)}</span>
                </div>
                <span className="date-count">
                  {grouped[date].length} report{grouped[date].length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="report-cards">
                {grouped[date].map((task) => (
                  <div key={task.id} className="report-card glass-panel">
                    <div className="report-card-header">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {task.employee_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="employee-name">{task.employee_name}</span>
                          <span className="project-label">{task.project_name}</span>
                        </div>
                      </div>
                      <div className="report-meta">
                        {task.hours_spent != null && (
                          <span className="hours-chip">
                            <Clock size={12} />
                            {task.hours_spent}h
                          </span>
                        )}
                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                          {task.priority === 'Critical' && <AlertTriangle size={11} />}
                          {task.priority}
                        </span>
                        <span className={`status-badge status-${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <div className="report-card-body">
                      <div className="report-section">
                        <span className="report-section-label">Accomplishments</span>
                        <p className="report-section-text">{task.accomplishments}</p>
                      </div>
                      {task.blockers && (
                        <div className="report-section">
                          <span className="report-section-label blocker-label">Blockers</span>
                          <p className="report-section-text">{task.blockers}</p>
                        </div>
                      )}
                      {task.tomorrow_plan && (
                        <div className="report-section">
                          <span className="report-section-label">Tomorrow&apos;s Plan</span>
                          <p className="report-section-text">{task.tomorrow_plan}</p>
                        </div>
                      )}
                    </div>

                    <div className="report-card-footer">
                      <span className="category-tag">
                        <Tag size={11} />
                        {task.task_category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
