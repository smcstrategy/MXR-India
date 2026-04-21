import { supabase } from '@/lib/supabase';
import { Briefcase, Calendar } from 'lucide-react';
import AddProjectForm from './AddProjectForm';
import './Projects.css';

interface Project {
  id: number;
  name: string;
  status: string;
  client_name: string | null;
  description: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  created_at: string;
}

async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('status')
    .order('name');
  if (error) {
    console.error('Failed to fetch projects:', error.message);
    return [];
  }
  return data ?? [];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ProjectCard({ project }: { project: Project }) {
  const isActive = project.status === 'active';
  return (
    <div className="project-card glass-panel">
      <div className="project-card-top">
        <span className={`project-status-badge ${isActive ? 'badge-active' : 'badge-sales'}`}>
          {isActive ? 'Active' : 'Sales Stage'}
        </span>
      </div>
      <h3 className="project-name">{project.name}</h3>
      {project.client_name && (
        <p className="project-client">{project.client_name}</p>
      )}
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}
      {(project.start_date || project.expected_end_date) && (
        <div className="project-dates">
          <Calendar size={13} className="project-dates-icon" />
          {project.start_date && (
            <span className="project-date-item">{formatDate(project.start_date)}</span>
          )}
          {project.start_date && project.expected_end_date && (
            <span className="project-date-sep">→</span>
          )}
          {project.expected_end_date && (
            <span className="project-date-item">{formatDate(project.expected_end_date)}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const activeProjects = projects.filter(p => p.status === 'active');
  const salesProjects = projects.filter(p => p.status === 'sales');

  return (
    <div className="projects-page">
      <div className="projects-page-header">
        <div>
          <h1 className="heading-xl">Projects</h1>
          <p className="subtitle text-secondary">Active and sales stage projects for MXR India.</p>
        </div>
        <AddProjectForm />
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty glass-panel">
          <Briefcase size={48} className="text-secondary projects-empty-icon" />
          <p className="heading-lg" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            No projects registered
          </p>
          <p className="text-secondary" style={{ marginTop: 8 }}>
            Click <strong>Add Project</strong> to register your first project.
          </p>
        </div>
      ) : (
        <div className="projects-sections">
          {/* 수행중 프로젝트 */}
          <div className="projects-section">
            <div className="projects-section-header">
              <div className="section-title-group">
                <span className="section-dot dot-active" />
                <h2 className="projects-section-title">Active Projects</h2>
                <span className="projects-section-count">{activeProjects.length}</span>
              </div>
            </div>
            {activeProjects.length === 0 ? (
              <p className="section-empty text-secondary">No active projects.</p>
            ) : (
              <div className="project-cards-grid">
                {activeProjects.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          {/* 영업단계 프로젝트 */}
          <div className="projects-section">
            <div className="projects-section-header">
              <div className="section-title-group">
                <span className="section-dot dot-sales" />
                <h2 className="projects-section-title">Sales Stage Projects</h2>
                <span className="projects-section-count">{salesProjects.length}</span>
              </div>
            </div>
            {salesProjects.length === 0 ? (
              <p className="section-empty text-secondary">No sales stage projects.</p>
            ) : (
              <div className="project-cards-grid">
                {salesProjects.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
