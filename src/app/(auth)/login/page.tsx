'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../Auth.css';

const KEY_SAVED_ID   = 'mxr_saved_id';
const KEY_AUTO_LOGIN = 'mxr_auto_login';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const savedId        = localStorage.getItem(KEY_SAVED_ID);
    const savedAutoLogin = localStorage.getItem(KEY_AUTO_LOGIN) === 'true';

    if (savedId) {
      setEmail(savedId);
      setRememberId(true);
    }
    if (savedAutoLogin) {
      setAutoLogin(true);
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace('/');
        } else {
          setChecking(false);
        }
      });
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message;
      setError(msg);
      setLoading(false);
      return;
    }

    if (rememberId) {
      localStorage.setItem(KEY_SAVED_ID, email);
    } else {
      localStorage.removeItem(KEY_SAVED_ID);
    }
    localStorage.setItem(KEY_AUTO_LOGIN, String(autoLogin));

    router.push('/');
  };

  if (checking) {
    return (
      <div className="auth-wrapper">
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">MXR</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="text-secondary">MXR India Operations</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && (
            <div className="auth-error">{error}</div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="name@mxr.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-options">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberId}
                  onChange={e => setRememberId(e.target.checked)}
                />
                Remember ID
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={e => setAutoLogin(e.target.checked)}
                />
                Auto Login
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?
          <Link href="/signup" className="auth-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
