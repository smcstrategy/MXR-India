import { CheckCircle, Clock, AlertTriangle, Tag, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './Dashboard.css';

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

export default async function Dashboard() {
  const recentTasks = await getRecentTasks();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = recentTasks.filter(t => t.task_date === today);
  const todayHours = todayTasks.reduce((acc, t) => acc + (t.hours_spent ?? 0), 0);

  // 지난 30일 기준으로 활동한 직원 목록 추출 → 오늘 미제출 계산
  const allEmployees = [...new Set(recentTasks.map(t => t.employee_name))].sort();
  const submittedSet = new Set(todayTasks.map(t => t.employee_name));
  const notSubmitted = allEmployees.filter(name => !submittedSet.has(name));

  const todayLabel = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

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

      {/* 오늘 일일업무 상세 */}
      {todayTasks.length > 0 && (
        <div className="today-reports-section">
          <h2 className="heading-lg" style={{ marginBottom: 16 }}>Today&apos;s Reports</h2>
          <div className="today-report-cards">
            {todayTasks.map(task => (
              <div key={task.id} className="today-report-card glass-panel">
                <div className="trc-header">
                  <div className="trc-employee">
                    <div className="employee-avatar">
                      {task.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="trc-employee-info">
                      <span className="trc-employee-name">{task.employee_name}</span>
                      <span className="trc-project"><Briefcase size={10} />{task.project_name}</span>
                    </div>
                  </div>
                  <div className="trc-meta">
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
                  </div>
                </div>

                <div className="trc-body">
                  <div className="trc-section">
                    <span className="trc-label">Accomplishments</span>
                    <p className="trc-text">{task.accomplishments}</p>
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
                    <Tag size={11} />
                    {task.task_category}
                  </span>
                  <span className={`status-badge status-${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
