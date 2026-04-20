import Link from 'next/link';
import { Home, FileText, Users, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">MXR</div>
          <span className="logo-text">India</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/reports" className="nav-item">
          <FileText size={20} />
          <span>Daily Reports</span>
        </Link>
        <Link href="/team" className="nav-item">
          <Users size={20} />
          <span>Team</span>
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
