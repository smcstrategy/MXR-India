'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import '../Auth.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate actual Supabase signInWithPassword
    // For UI demonstration, we just route to dashboard
    router.push('/');
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

          <button type="submit" className="btn-primary auth-btn">Sign In</button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <Link href="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
