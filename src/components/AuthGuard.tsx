'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;

      if (!session) {
        router.replace('/login');
        return;
      }

      const meta = session.user.user_metadata;

      if (meta?.role === 'admin') {
        setReady(true);
        return;
      }

      if (meta?.approved === false) {
        router.replace('/pending');
        return;
      }

      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
