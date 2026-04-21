'use client';

import { useActionState, useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createDailyTask } from '../actions';
import { supabase } from '@/lib/supabase';
import './NewTaskForm.css';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface Props {
  projects: Project[];
}

const CATEGORIES = ['Development', 'Testing', 'Meeting', 'Design', 'Documentation', 'Deployment', 'Support', 'General'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

type ActionState = { success?: boolean; error?: string } | null;

export default function NewTaskForm({ projects }: Props) {
  const [showCustomProject, setShowCustomProject] = useState(false);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name =
        data.user?.user_metadata?.full_name ??
        data.user?.email ??
        '';
      setEmployeeName(name);
    });
  }, []);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prev: ActionState, formData: FormData) => {
      try {
        await createDailyTask(formData);
        return { success: true };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        if (msg.includes('NEXT_REDIRECT')) throw e;
        return { error: msg };
      }
    },
    null
  );

  const today = new Date().toISOString().split('T')[0];
  const activeProjects = projects.filter(p => p.status === 'active');
  const salesProjects = projects.filter(p => p.status === 'sales');

  return (
    <div className="new-task-container">
      <div className="new-task-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <div>
          <h1 className="heading-xl">Register Daily Task</h1>
          <p className="subtitle text-secondary">Log your work activities for the day.</p>
        </div>
      </div>

      {state?.error && (
        <div className="form-alert form-alert-error">
          <AlertCircle size={18} />
          <span>{state.error}</span>
        </div>
      )}

      <div className="new-task-card glass-panel">
        <form action={formAction} className="task-form">
          {/* Row 1: Employee & Date */}
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="input-label" htmlFor="employee_name">
                Employee Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="employee_name"
                name="employee_name"
                className="input-field input-autofilled"
                value={employeeName}
                onChange={() => {}}
                readOnly
                placeholder="Loading user info..."
                required
                disabled={isPending}
              />
            </div>
            <div className="input-group flex-1">
              <label className="input-label" htmlFor="task_date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="task_date"
                name="task_date"
                className="input-field"
                defaultValue={today}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Row 2: Project (select) & Category */}
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="input-label" htmlFor="project_name">
                Project / Task <span className="required">*</span>
              </label>
              <select
                id="project_name"
                name="project_name"
                className="input-field"
                required
                disabled={isPending}
                onChange={e => setShowCustomProject(e.target.value === '__other__')}
              >
                <option value="">-- Select Project --</option>
                {activeProjects.length > 0 && (
                  <optgroup label="Active Projects">
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </optgroup>
                )}
                {salesProjects.length > 0 && (
                  <optgroup label="Sales Stage Projects">
                    {salesProjects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </optgroup>
                )}
                <option value="__other__">Other (type manually)</option>
              </select>
              {showCustomProject && (
                <input
                  type="text"
                  name="project_name_custom"
                  className="input-field"
                  placeholder="Enter project name..."
                  style={{ marginTop: 8 }}
                  required
                  disabled={isPending}
                />
              )}
            </div>
            <div className="input-group" style={{ width: '200px' }}>
              <label className="input-label" htmlFor="task_category">Category</label>
              <select id="task_category" name="task_category" className="input-field" disabled={isPending}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Hours & Priority */}
          <div className="form-row">
            <div className="input-group" style={{ width: '180px' }}>
              <label className="input-label" htmlFor="hours_spent">Hours Spent</label>
              <input
                type="number"
                id="hours_spent"
                name="hours_spent"
                className="input-field"
                placeholder="8"
                min="0"
                max="24"
                step="0.5"
                disabled={isPending}
              />
            </div>
            <div className="input-group" style={{ width: '160px' }}>
              <label className="input-label" htmlFor="priority">Priority</label>
              <select id="priority" name="priority" className="input-field" defaultValue="Medium" disabled={isPending}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Accomplishments */}
          <div className="input-group">
            <label className="input-label" htmlFor="accomplishments">
              What did you accomplish today? <span className="required">*</span>
            </label>
            <textarea
              id="accomplishments"
              name="accomplishments"
              className="input-field textarea"
              rows={4}
              placeholder="Describe the tasks completed, milestones reached, meetings attended..."
              required
              disabled={isPending}
            />
          </div>

          {/* Blockers */}
          <div className="input-group">
            <label className="input-label" htmlFor="blockers">Any blockers or issues?</label>
            <textarea
              id="blockers"
              name="blockers"
              className="input-field textarea"
              rows={2}
              placeholder="List any dependencies or problems you are facing..."
              disabled={isPending}
            />
          </div>

          {/* Tomorrow Plan */}
          <div className="input-group">
            <label className="input-label" htmlFor="tomorrow_plan">Plan for tomorrow</label>
            <textarea
              id="tomorrow_plan"
              name="tomorrow_plan"
              className="input-field textarea"
              rows={2}
              placeholder="Briefly describe what you'll work on next..."
              disabled={isPending}
            />
          </div>

          {/* Actions */}
          <div className="form-actions-row border-top">
            <Link href="/" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary flex-center gap-2 submit-btn"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Submit Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
