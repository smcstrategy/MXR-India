'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../Auth.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">MXR</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="text-secondary">Sign in to MXR India Operations</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="text-danger" style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>{error}</div>}
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email address</label>
            <input 
              type="email" 
              id="email" 
              className="input-field" 
              placeholder="name@mxr.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="auth-options">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberId} 
                  onChange={(e) => setRememberId(e.target.checked)} 
                />
                아이디 저장
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={autoLogin} 
                  onChange={(e) => setAutoLogin(e.target.checked)} 
                />
                자동 로그인
              </label>
            </div>
            <a href="#" className="auth-link" style={{ marginLeft: 0 }}>Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link href="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
