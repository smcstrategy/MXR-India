import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Briefcase, Clock, Tag, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import './TaskDetail.css';

interface Props {
  params: Promise<{ id: string }>;
}

async function getTask(id: string) {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    notFound();
  }

  const dateLabel = new Date(task.task_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="detail-container">
      <div className="detail-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="detail-title-wrap">
          <h1 className="heading-xl">Task Details</h1>
          <p className="subtitle text-secondary">Reference ID: #{task.id}</p>
        </div>
      </div>

      <div className="detail-grid">
        {/* Main Content Column */}
        <div className="detail-main-col">
          <div className="detail-card glass-panel">
            <div className="detail-section">
              <h2 className="detail-section-title">
                <CheckCircle size={18} className="text-blue" />
                <span>Accomplishments</span>
              </h2>
              <div className="detail-content-box">
                <p className="detail-text-large">{task.accomplishments}</p>
              </div>
            </div>

            {task.blockers && (
              <div className="detail-section">
                <h2 className="detail-section-title">
                  <AlertTriangle size={18} className="text-red" />
                  <span>Blockers & Issues</span>
                </h2>
                <div className="detail-content-box bg-red-dim">
                  <p className="detail-text">{task.blockers}</p>
                </div>
              </div>
            )}

            {task.tomorrow_plan && (
              <div className="detail-section">
                <h2 className="detail-section-title">
                  <Calendar size={18} className="text-purple" />
                  <span>Plan for Tomorrow</span>
                </h2>
                <div className="detail-content-box">
                  <p className="detail-text">{task.tomorrow_plan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="detail-side-col">
          <div className="info-card glass-panel">
            <h3 className="info-card-title">Task Information</h3>
            
            <div className="info-item">
              <User size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Employee</span>
                <span className="info-value">{task.employee_name}</span>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Date</span>
                <span className="info-value">{dateLabel}</span>
              </div>
            </div>

            <div className="info-item">
              <Briefcase size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Project</span>
                <span className="info-value">{task.project_name}</span>
              </div>
            </div>

            <div className="info-item">
              <Clock size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Hours Spent</span>
                <span className="info-value">{task.hours_spent ?? 0} hours</span>
              </div>
            </div>

            <div className="info-item">
              <Tag size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Category</span>
                <span className="info-value">{task.task_category}</span>
              </div>
            </div>

            <div className="info-item">
              <MessageSquare size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Priority</span>
                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="info-item">
              <CheckCircle size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Status</span>
                <span className={`status-badge status-${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
