import { Plus, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import './Dashboard.css';

export default function Dashboard() {
  // Mock data for the UI since DB is not connected yet
  const recentReports = [
    { id: 1, employee: 'Amit Patel', project: 'Noida Data Center', status: 'Submitted', date: 'Today, 09:30 AM' },
    { id: 2, employee: 'Priya Sharma', project: 'Mumbai HQ Upgrade', status: 'Reviewed', date: 'Yesterday, 05:45 PM' },
    { id: 3, employee: 'Rahul Singh', project: 'Delhi Smart Grid', status: 'Submitted', date: 'Yesterday, 10:15 AM' },
    { id: 4, employee: 'Neha Gupta', project: 'Bangalore Office', status: 'Pending', date: 'Oct 18, 04:20 PM' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="heading-xl">Welcome back, Ravi</h1>
          <p className="subtitle text-secondary">Here's the daily operation summary for MXR India.</p>
        </div>
        <Link href="/reports/new" className="btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>New Daily Report</span>
        </Link>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-blue">
            <TrendingUp size={24} className="text-blue" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Reports This Week</span>
            <span className="metric-value">124</span>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-green">
            <CheckCircle size={24} className="text-green" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Completion Rate</span>
            <span className="metric-value">92%</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap bg-amber">
            <Clock size={24} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Pending Reviews</span>
            <span className="metric-value">18</span>
          </div>
        </div>
      </div>

      <div className="recent-reports section-card glass-panel">
        <div className="section-header">
          <h2 className="heading-lg">Recent Daily Reports</h2>
          <Link href="/reports" className="view-all">View All</Link>
        </div>
        
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Project / Task</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar">{report.employee.charAt(0)}</div>
                      <span>{report.employee}</span>
                    </div>
                  </td>
                  <td>{report.project}</td>
                  <td>
                    <span className={`status-badge status-${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="text-secondary">{report.date}</td>
                  <td>
                    <button className="action-link">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
