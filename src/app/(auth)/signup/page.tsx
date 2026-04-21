'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../Auth.css';

export default function SignUp() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, approved: false, role: 'user' } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/pending');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">MXR</div>
          <h1 className="auth-title">Sign Up</h1>
          <p className="text-secondary">MXR India Operations Team</p>
        </div>

        <form className="auth-form" onSubmit={handleSignUp}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Full Name <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder="e.g. Ravi Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
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
            <label className="input-label" htmlFor="password">
              Password <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link href="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
