import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, Clock, CheckCircle, List, User, Tag } from 'lucide-react';
import '../../daily-tasks/[id]/TaskDetail.css'; // Reusing some detail styles

interface Props {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data;
}

async function getProjectTasks(projectName: string) {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('project_name', projectName)
    .order('task_date', { ascending: false });
  
  if (error) return [];
  return data ?? [];
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const tasks = await getProjectTasks(project.name);

  return (
    <div className="detail-container">
      <div className="detail-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="detail-title-wrap">
          <h1 className="heading-xl">{project.name}</h1>
          <p className="subtitle text-secondary">Project Details & History</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main-col">
          <div className="detail-card glass-panel">
            <div className="detail-section">
              <h2 className="detail-section-title">
                <List size={18} className="text-blue" />
                <span>Reports History</span>
              </h2>
              
              <div className="project-tasks-list">
                {tasks.length === 0 ? (
                  <p className="text-secondary" style={{ padding: '20px' }}>No reports registered for this project yet.</p>
                ) : (
                  tasks.map(task => (
                    <Link key={task.id} href={`/daily-tasks/${task.id}`} className="project-task-item glass-panel">
                      <div className="pti-header">
                        <div className="pti-user">
                          <div className="employee-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                            {task.employee_name.charAt(0)}
                          </div>
                          <span className="pti-name">{task.employee_name}</span>
                        </div>
                        <span className="pti-date">{task.task_date}</span>
                      </div>
                      <p className="pti-text">{task.accomplishments}</p>
                      <div className="pti-footer">
                        <span className="pti-meta"><Clock size={12} /> {task.hours_spent}h</span>
                        <span className="pti-meta"><Tag size={12} /> {task.task_category}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-side-col">
          <div className="info-card glass-panel">
            <h3 className="info-card-title">Project Info</h3>
            
            <div className="info-item">
              <Briefcase size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Project Name</span>
                <span className="info-value">{project.name}</span>
              </div>
            </div>

            <div className="info-item">
              <CheckCircle size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Current Status</span>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>
                  {project.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={16} />
              <div className="info-label-wrap">
                <span className="info-label">Total Reports</span>
                <span className="info-value">{tasks.length}</span>
              </div>
            </div>

            {project.description && (
              <div className="info-item">
                <div className="info-label-wrap">
                  <span className="info-label">Description</span>
                  <p style={{ fontSize: '0.85rem', marginTop: 4 }}>{project.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .project-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .project-task-item {
          padding: 16px;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, background 0.2s;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .project-task-item:hover {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.05);
        }
        .pti-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pti-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pti-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .pti-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .pti-text {
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pti-footer {
          display: flex;
          gap: 12px;
        }
        .pti-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}} />
    </div>
  );
}
