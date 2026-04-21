'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  approved: boolean | null;
  created_at: string;
}

export async function listAllUsers(): Promise<UserRecord[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(error.message);
  return data.users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    full_name: (u.user_metadata?.full_name as string) ?? '',
    role: (u.user_metadata?.role as string) ?? 'user',
    approved: u.user_metadata?.approved === undefined ? null : (u.user_metadata?.approved as boolean),
    created_at: u.created_at,
  }));
}

export async function resetUserPassword(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: '111111',
  });
  if (error) throw new Error(error.message);
}

export async function approveUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { approved: true },
  });
  if (error) throw new Error(error.message);
}

export async function rejectUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

export async function toggleUserRole(userId: string, currentRole: string): Promise<void> {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole },
  });
  if (error) throw new Error(error.message);
}
