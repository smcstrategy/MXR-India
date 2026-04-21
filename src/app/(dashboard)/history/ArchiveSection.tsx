'use client';

import { Download, Archive, Users, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ArchiveRecord {
  id: number;
  year_month: string;
  task_count: number;
  employee_count: number;
  created_at: string;
  tasks_data: TaskRow[];
}

interface TaskRow {
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

function downloadExcel(archive: ArchiveRecord) {
  const rows = archive.tasks_data.map(t => ({
    Date:              t.task_date,
    Employee:          t.employee_name,
    Project:           t.project_name,
    Category:          t.task_category,
    'Hours Spent':     t.hours_spent ?? '',
    Accomplishments:   t.accomplishments,
    'Blockers':        t.blockers ?? '',
    "Tomorrow's Plan": t.tomorrow_plan ?? '',
    Priority:          t.priority,
    Status:            t.status,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 14 },
    { wch: 10 }, { wch: 50 }, { wch: 30 }, { wch: 30 },
    { wch: 10 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, formatYearMonth(archive.year_month));
  XLSX.writeFile(wb, `MXR-India-Work-History-${archive.year_month}.xlsx`);
}

function formatYearMonth(ym: string) {
  const [y, m] = ym.split('-');
  const date   = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export default function ArchiveSection({ archives }: { archives: ArchiveRecord[] }) {
  if (archives.length === 0) return null;

  return (
    <div className="archive-section">
      <div className="archive-section-header">
        <Archive size={18} style={{ color: 'var(--primary-color)' }} />
        <h2 className="heading-lg">Monthly Archives</h2>
      </div>
      <div className="archive-grid">
        {archives.map(archive => (
          <div key={archive.id} className="archive-card glass-panel">
            <div className="archive-card-top">
              <span className="archive-month">{formatYearMonth(archive.year_month)}</span>
              <span className="archive-date-label">
                Archived {new Date(archive.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="archive-stats">
              <span className="archive-stat">
                <FileText size={13} /> {archive.task_count} reports
              </span>
              <span className="archive-stat">
                <Users size={13} /> {archive.employee_count} employees
              </span>
            </div>
            <button
              className="archive-download-btn"
              onClick={() => downloadExcel(archive)}
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
