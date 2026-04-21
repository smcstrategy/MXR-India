'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '../Auth.css';

export default function PendingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login'); return; }
      setName(data.user.user_metadata?.full_name ?? '');
      setEmail(data.user.email ?? '');
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'rgba(245,158,11,0.15)', boxShadow: 'none', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Clock size={24} style={{ color: 'var(--warning-color)' }} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.4rem' }}>Pending Approval</h1>
          <p className="text-secondary">
            {name && <><strong style={{ color: 'var(--text-primary)' }}>{name}</strong>, </>}
            your sign-up request has been received.
          </p>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: 4 }}>{email}</p>
        </div>

        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          padding: '16px 20px',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          You will be able to log in once an admin approves your account.<br />
          Please sign in again after approval.
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto', cursor: 'pointer' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
