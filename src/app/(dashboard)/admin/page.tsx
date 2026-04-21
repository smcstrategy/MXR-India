'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, RotateCcw, Loader2, Users, Clock, Check, X, ShieldCheck, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  listAllUsers, resetUserPassword, approveUser, rejectUser, toggleUserRole,
  type UserRecord,
} from './actions';
import './Admin.css';

type ActionState = { id: string; type: string } | null;

export default function AdminPage() {
  const [users, setUsers]               = useState<UserRecord[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [action, setAction]             = useState<ActionState>(null);
  const [msg, setMsg]                   = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    const list = await listAllUsers();
    setUsers(list);
  }, []);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data.user?.user_metadata?.role !== 'admin') {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      try { await loadUsers(); } catch (e) { console.error(e); }
      setLoading(false);
    }
    init();
  }, [loadUsers]);

  const showMsg = (id: string, ok: boolean, text: string) => {
    setMsg({ id, ok, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleApprove = async (user: UserRecord, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    console.log('[Admin] Approving user:', user.email);
    setAction({ id: user.id, type: 'approve' });
    try {
      await approveUser(user.id);
      showMsg(user.id, true, 'Approved');
      await loadUsers();
    } catch (e) {
      console.error('[Admin] Approve error:', e);
      showMsg(user.id, false, e instanceof Error ? e.message : 'Failed');
    } finally { setAction(null); }
  };

  const handleReject = async (user: UserRecord, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const label = user.full_name || user.email;
    console.log('[Admin] Rejecting user:', user.email);
    if (!window.confirm(`Reject and delete ${label}'s account?`)) return;
    setAction({ id: user.id, type: 'reject' });
    try {
      await rejectUser(user.id);
      await loadUsers();
    } catch (e) {
      console.error('[Admin] Reject error:', e);
      showMsg(user.id, false, e instanceof Error ? e.message : 'Failed');
    } finally { setAction(null); }
  };

  const handleToggleRole = async (user: UserRecord, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const label = user.full_name || user.email;
    const next = user.role === 'admin' ? 'Member' : 'Admin';
    console.log('[Admin] Toggling role for:', user.email, 'Current:', user.role, 'Next:', next);
    
    if (!window.confirm(`Change ${label}'s role to ${next}?`)) {
      console.log('[Admin] Role change cancelled by user');
      return;
    }
    
    setAction({ id: user.id, type: 'role' });
    try {
      await toggleUserRole(user.id, user.role);
      showMsg(user.id, true, `Changed to ${next}`);
      await loadUsers();
    } catch (e) {
      console.error('[Admin] Role toggle error:', e);
      showMsg(user.id, false, e instanceof Error ? e.message : 'Failed');
    } finally { setAction(null); }
  };

  const handleDelete = async (user: UserRecord, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const label = user.full_name || user.email;
    console.log('[Admin] Deleting user:', user.email);
    if (!window.confirm(`Permanently delete ${label}'s account?\nThis action cannot be undone.`)) return;
    setAction({ id: user.id, type: 'delete' });
    try {
      await rejectUser(user.id);
      await loadUsers();
    } catch (e) {
      console.error('[Admin] Delete error:', e);
      showMsg(user.id, false, e instanceof Error ? e.message : 'Delete failed');
    } finally { setAction(null); }
  };

  const handleReset = async (user: UserRecord, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const label = user.full_name || user.email;
    console.log('[Admin] Resetting password for:', user.email);
    if (!window.confirm(`Reset ${label}'s password to 111111?`)) return;
    setAction({ id: user.id, type: 'reset' });
    try {
      await resetUserPassword(user.id);
      showMsg(user.id, true, 'Password reset');
    } catch (e) {
      console.error('[Admin] Reset error:', e);
      showMsg(user.id, false, e instanceof Error ? e.message : 'Failed');
    } finally { setAction(null); }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={32} className="spin-icon text-secondary" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="admin-denied glass-panel">
        <Shield size={48} className="text-secondary" />
        <h2 className="heading-lg">Access Denied</h2>
        <p className="text-secondary">Please log in with an admin account.</p>
      </div>
    );
  }

  const pendingUsers  = users.filter(u => u.approved === false);
  const approvedUsers = users.filter(u => u.approved !== false);

  return (
    <div className="admin-page">
      <div className="dashboard-header">
        <div>
          <h1 className="heading-xl">Admin</h1>
          <p className="subtitle text-secondary">User Account Management</p>
        </div>
      </div>

      {/* Pending approval */}
      <div className="admin-card glass-panel section-card">
        <div className="section-header">
          <h2 className="heading-lg">
            <Clock size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--warning-color)' }} />
            Pending Approval
            {pendingUsers.length > 0 && (
              <span className="pending-badge">{pendingUsers.length}</span>
            )}
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <p className="text-secondary" style={{ fontSize: '0.88rem' }}>No pending sign-up requests.</p>
        ) : (
          <div className="user-list">
            {pendingUsers.map(user => {
              const busy = action?.id === user.id;
              return (
                <div key={user.id} className="user-row user-row-pending">
                  <div className="employee-avatar avatar-pending">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.full_name || '(No name)'}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <span className="user-date">
                    {new Date(user.created_at).toLocaleDateString('en-US')} registered
                  </span>
                  {msg?.id === user.id && (
                    <span className={`reset-msg ${msg.ok ? 'reset-ok' : 'reset-fail'}`}>{msg.text}</span>
                  )}
                  <div className="action-btns">
                    <button className="approve-btn" onClick={(e) => handleApprove(user, e)} disabled={busy}>
                      {busy && action?.type === 'approve' ? <Loader2 size={14} className="spin-icon" /> : <Check size={14} />}
                      Approve
                    </button>
                    <button className="reject-btn" onClick={(e) => handleReject(user, e)} disabled={busy}>
                      {busy && action?.type === 'reject' ? <Loader2 size={14} className="spin-icon" /> : <X size={14} />}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active user management */}
      <div className="admin-card glass-panel section-card">
        <div className="section-header">
          <h2 className="heading-lg">
            <Users size={18} style={{ display: 'inline', marginRight: 8 }} />
            User Management ({approvedUsers.length})
          </h2>
        </div>

        {approvedUsers.length === 0 ? (
          <p className="text-secondary" style={{ fontSize: '0.88rem' }}>No registered users.</p>
        ) : (
          <div className="user-list">
            {approvedUsers.map(user => {
              const busy = action?.id === user.id;
              const isAdminUser = user.role === 'admin';
              return (
                <div key={user.id} className="user-row">
                  <div className="employee-avatar">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.full_name || '(No name)'}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <span className={`role-badge ${isAdminUser ? 'role-admin' : 'role-user'}`}>
                    {isAdminUser ? <ShieldCheck size={12} /> : <User size={12} />}
                    {isAdminUser ? 'Admin' : 'Member'}
                  </span>
                  {msg?.id === user.id && (
                    <span className={`reset-msg ${msg.ok ? 'reset-ok' : 'reset-fail'}`}>{msg.text}</span>
                  )}
                  <div className="action-btns">
                    <button className="role-btn" onClick={(e) => handleToggleRole(user, e)} disabled={busy} title={isAdminUser ? 'Change to Member' : 'Change to Admin'}>
                      {busy && action?.type === 'role' ? <Loader2 size={14} className="spin-icon" /> : <Shield size={14} />}
                      {isAdminUser ? 'Make Member' : 'Make Admin'}
                    </button>
                    <button className="reset-btn" onClick={(e) => handleReset(user, e)} disabled={busy} title="Reset password to 111111">
                      {busy && action?.type === 'reset' ? <Loader2 size={14} className="spin-icon" /> : <RotateCcw size={14} />}
                      Reset PW
                    </button>
                    <button className="delete-btn" onClick={(e) => handleDelete(user, e)} disabled={busy} title="Delete account">
                      {busy && action?.type === 'delete' ? <Loader2 size={14} className="spin-icon" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
