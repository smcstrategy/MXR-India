import { CheckCircle, Clock, AlertTriangle, Tag, Briefcase, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './Dashboard.css';
import './reports/Reports.css';

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

async function getRecentTasks(): Promise<DailyTask[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .gte('task_date', thirtyDaysAgo)
    .order('task_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch tasks:', error.message);
    return [];
  }
  return data ?? [];
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

export default async function Dashboard() {
  const recentTasks = await getRecentTasks();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = recentTasks.filter(t => t.task_date === today);

  const allEmployees = [...new Set(recentTasks.map(t => t.employee_name))].sort();
  const submittedSet = new Set(todayTasks.map(t => t.employee_name));
  const notSubmitted = allEmployees.filter(name => !submittedSet.has(name));

  const todayLabel = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const grouped = recentTasks.reduce<Record<string, DailyTask[]>>((acc, t) => {
    (acc[t.task_date] ??= []).push(t);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="heading-xl">MXR India Dashboard</h1>
          <p className="subtitle text-secondary">{todayLabel}</p>
        </div>
      </div>

      {/* 오늘 현황: 제출 완료 vs 미제출 */}
      <div className="today-status-card section-card glass-panel">
        <h2 className="heading-lg section-title-sm">Today&apos;s Status</h2>
        <div className="today-status-grid">
          {/* 제출 완료 */}
          <div className="status-panel">
            <div className="status-panel-label label-submitted">
              <CheckCircle size={14} />
              <span>Submitted</span>
              <span className="status-count">{todayTasks.length}</span>
            </div>
            <div className="status-person-list">
              {todayTasks.length === 0 ? (
                <p className="status-empty text-secondary">No submissions yet</p>
              ) : (
                todayTasks.map(task => (
                  <div key={task.id} className="status-person">
                    <div className="employee-avatar avatar-submitted">
                      {task.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="status-person-info">
                      <span className="status-name">{task.employee_name}</span>
                      <span className="status-project">{task.project_name}</span>
                    </div>
                    {task.hours_spent != null && (
                      <span className="status-hours">{task.hours_spent}h</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="status-divider" />

          {/* 미제출 */}
          <div className="status-panel">
            <div className="status-panel-label label-missing">
              <AlertTriangle size={14} />
              <span>Not Submitted</span>
              <span className="status-count">{notSubmitted.length}</span>
            </div>
            <div className="status-person-list">
              {notSubmitted.length === 0 ? (
                <div className="all-submitted-msg">
                  <CheckCircle size={18} className="text-green" />
                  <span className="text-secondary">Everyone submitted!</span>
                </div>
              ) : (
                notSubmitted.map(name => (
                  <div key={name} className="status-person">
                    <div className="employee-avatar avatar-missing">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="status-person-info">
                      <span className="status-name">{name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 전체 일일업무 타임라인 */}
      {recentTasks.length > 0 && (
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
                          <span className="project-label">
                            <Briefcase size={10} style={{ display: 'inline', marginRight: 4 }} />
                            {task.project_name}
                          </span>
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
