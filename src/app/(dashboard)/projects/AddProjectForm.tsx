'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { createProject } from './actions';
import { useState } from 'react';

type ActionState = { success?: boolean; error?: string } | null;

export default function AddProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prev, formData) => {
      try {
        await createProject(formData);
        return { success: true };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return { error: msg };
      }
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  if (!isOpen) {
    return (
      <button className="btn-primary add-project-btn" onClick={() => setIsOpen(true)}>
        <Plus size={18} />
        Add Project
      </button>
    );
  }

  return (
    <div className="add-project-panel glass-panel">
      <div className="add-project-panel-header">
        <h3 className="heading-lg">Add New Project</h3>
        <button className="close-panel-btn" onClick={() => setIsOpen(false)} type="button">
          <X size={20} />
        </button>
      </div>

      {state?.error && (
        <div className="form-alert form-alert-error">
          <AlertCircle size={16} />
          <span>{state.error}</span>
        </div>
      )}

      <form ref={formRef} action={formAction} className="add-project-form">
        {/* Row 1: Name + Status */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="input-label" htmlFor="proj-name">
              Project Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="proj-name"
              name="name"
              className="input-field"
              placeholder="e.g. Noida Data Center Setup"
              required
              disabled={isPending}
            />
          </div>
          <div className="input-group" style={{ width: '180px' }}>
            <label className="input-label" htmlFor="proj-status">
              Status <span className="required">*</span>
            </label>
            <select id="proj-status" name="status" className="input-field" required disabled={isPending}>
              <option value="active">Active</option>
              <option value="sales">Sales Stage</option>
            </select>
          </div>
        </div>

        {/* Row 2: Client */}
        <div className="input-group">
          <label className="input-label" htmlFor="proj-client">Client</label>
          <input
            type="text"
            id="proj-client"
            name="client_name"
            className="input-field"
            placeholder="예: Reliance Industries"
            disabled={isPending}
          />
        </div>

        {/* Row 3: Dates */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="input-label" htmlFor="proj-start">Start Date</label>
            <input
              type="date"
              id="proj-start"
              name="start_date"
              className="input-field"
              disabled={isPending}
            />
          </div>
          <div className="input-group flex-1">
            <label className="input-label" htmlFor="proj-end">Expected End Date</label>
            <input
              type="date"
              id="proj-end"
              name="expected_end_date"
              className="input-field"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label" htmlFor="proj-desc">Description</label>
          <textarea
            id="proj-desc"
            name="description"
            className="input-field textarea"
            rows={2}
            placeholder="Brief overview of the project..."
            disabled={isPending}
          />
        </div>

        {/* Actions */}
        <div className="form-actions-row border-top">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-center gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
