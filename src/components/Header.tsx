'use client';

import { useEffect, useState } from 'react';
import { Search, UserCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import './Header.css';

export default function Header() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setName(meta?.full_name ?? data.user?.email ?? '');
      setRole(meta?.role === 'admin' ? 'Admin' : 'Member');
    });
  }, []);

  return (
    <header className="header glass-panel">
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search reports, team members..." className="search-input" />
      </div>

      <div className="header-actions">
        <div className="user-profile">
          <UserCircle size={32} className="avatar-icon" />
          <div className="user-info">
            <span className="user-name">{name}</span>
            <span className="user-role">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
