'use client';

import { useActionState, useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createDailyTask, updateDailyTask } from '../actions';
import { supabase } from '@/lib/supabase';
import './NewTaskForm.css';

interface Project {
  id: number;
  name: string;
  status: string;
}

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
}

interface Props {
  projects: Project[];
  initialData?: DailyTask;
}

const CATEGORIES = ['Development', 'Testing', 'Meeting', 'Design', 'Documentation', 'Deployment', 'Support', 'General'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

type ActionState = { success?: boolean; error?: string } | null;

export default function NewTaskForm({ projects, initialData }: Props) {
  const isEdit = !!initialData;
  const [showCustomProject, setShowCustomProject] = useState(false);
  const [employeeName, setEmployeeName] = useState(initialData?.employee_name ?? '');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uId = data.user?.id ?? '';
      setUserId(uId);
      
      if (!isEdit) {
        const name =
          data.user?.user_metadata?.full_name ??
          data.user?.email ??
          '';
        setEmployeeName(name);
      }
    });
  }, [isEdit]);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prev: ActionState, formData: FormData) => {
      try {
        if (isEdit) {
          await updateDailyTask(initialData.id, formData);
        } else {
          await createDailyTask(formData);
        }
        return { success: true };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        // Handle redirect from server action
        if (msg.includes('NEXT_REDIRECT')) throw e;
        return { error: msg };
      }
    },
    null
  );

  const today = new Date().toISOString().split('T')[0];
  const activeProjects = projects.filter(p => p.status === 'active');
  const salesProjects = projects.filter(p => p.status === 'sales');

  // Check if project is in list
  const isProjectInList = (name: string) => [...activeProjects, ...salesProjects].some(p => p.name === name);
  const initialProjectValue = initialData ? (isProjectInList(initialData.project_name) ? initialData.project_name : '__other__') : '';

  useEffect(() => {
    if (initialData && !isProjectInList(initialData.project_name)) {
      setShowCustomProject(true);
    }
  }, [initialData, activeProjects, salesProjects]);

  return (
    <div className="new-task-container">
      <div className="new-task-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <div>
          <h1 className="heading-xl">{isEdit ? 'Edit Daily Task' : 'Register Daily Task'}</h1>
          <p className="subtitle text-secondary">
            {isEdit ? 'Update your activity log.' : 'Log your work activities for the day.'}
          </p>
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
          <input type="hidden" name="user_id" value={userId} />

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
                onChange={(e) => setEmployeeName(e.target.value)}
                readOnly={!isEdit} // Allow edit if admin/owner? No, usually name is fixed. But in edit mode we might want it visible.
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
                defaultValue={initialData?.task_date ?? today}
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
                defaultValue={initialProjectValue}
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
                  defaultValue={initialProjectValue === '__other__' ? initialData?.project_name : ''}
                  required
                  disabled={isPending}
                />
              )}
            </div>
            <div className="input-group" style={{ width: '200px' }}>
              <label className="input-label" htmlFor="task_category">Category</label>
              <select 
                id="task_category" 
                name="task_category" 
                className="input-field" 
                disabled={isPending}
                defaultValue={initialData?.task_category ?? 'General'}
              >
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
                defaultValue={initialData?.hours_spent ?? ''}
                disabled={isPending}
              />
            </div>
            <div className="input-group" style={{ width: '160px' }}>
              <label className="input-label" htmlFor="priority">Priority</label>
              <select 
                id="priority" 
                name="priority" 
                className="input-field" 
                defaultValue={initialData?.priority ?? 'Medium'} 
                disabled={isPending}
              >
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
              defaultValue={initialData?.accomplishments ?? ''}
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
              defaultValue={initialData?.blockers ?? ''}
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
              defaultValue={initialData?.tomorrow_plan ?? ''}
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
                  <span>{isEdit ? 'Updating...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEdit ? 'Update Task' : 'Submit Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
