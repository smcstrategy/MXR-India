'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, FileText, Briefcase, History, Shield, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PWAInstallButton from './PWAInstallButton';
import './Sidebar.css';

const NAV_ITEMS = [
  { href: '/reports', icon: FileText, label: 'Daily Reports' },
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/projects', icon: Briefcase, label: 'Projects' },
  { href: '/history', icon: History, label: 'Work History' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.user_metadata?.role === 'admin');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">MXR</div>
          <span className="logo-text">India</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item${pathname === href ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <PWAInstallButton />
        {isAdmin && (
          <Link
            href="/admin"
            className={`nav-item nav-item-admin${pathname === '/admin' ? ' active' : ''}`}
          >
            <Shield size={20} />
            <span>Admin</span>
          </Link>
        )}
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
