import { Bell, Search, UserCircle } from 'lucide-react';
import './Header.css';

export default function Header() {
  return (
    <header className="header glass-panel">
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search reports, team members..." className="search-input" />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        
        <div className="user-profile">
          <UserCircle size={32} className="avatar-icon" />
          <div className="user-info">
            <span className="user-name">Ravi Kumar</span>
            <span className="user-role">India Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
