import { Save, ArrowLeft, Paperclip } from 'lucide-react';
import Link from 'next/link';
import './Form.css';

export default function NewReport() {
  return (
    <div className="form-container">
      <div className="form-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="heading-xl">New Daily Report</h1>
        <p className="subtitle text-secondary">Submit your work progress for today.</p>
      </div>

      <div className="form-card glass-panel">
        <form className="report-form">
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="input-label" htmlFor="project">Project / Task Name *</label>
              <input type="text" id="project" className="input-field" placeholder="e.g. Noida Data Center Migration" required />
            </div>
            
            <div className="input-group flex-1">
              <label className="input-label" htmlFor="date">Date *</label>
              <input type="date" id="date" className="input-field" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="hours">Hours Spent</label>
            <input type="number" id="hours" className="input-field" placeholder="8" min="0" max="24" step="0.5" />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="progress">What did you accomplish today? *</label>
            <textarea id="progress" className="input-field textarea" rows={4} placeholder="Describe the tasks completed, milestones reached..." required></textarea>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="blockers">Any blockers or issues?</label>
            <textarea id="blockers" className="input-field textarea" rows={2} placeholder="List any dependencies or problems you are facing..."></textarea>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="next-steps">Plan for tomorrow</label>
            <textarea id="next-steps" className="input-field textarea" rows={2} placeholder="Briefly describe what you'll work on next..."></textarea>
          </div>

          <div className="form-actions border-top">
            <div className="attachment-btn">
              <Paperclip size={18} />
              <span>Attach File</span>
              <input type="file" className="hidden-input" />
            </div>
            
            <div className="action-buttons">
              <button type="button" className="btn-secondary">Save Draft</button>
              <button type="submit" className="btn-primary flex-center gap-2">
                <Save size={18} />
                <span>Submit Report</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
