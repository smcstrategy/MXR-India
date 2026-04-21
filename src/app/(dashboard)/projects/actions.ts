'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const status = formData.get('status') as string;
  const clientName = formData.get('client_name') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('start_date') as string;
  const expectedEndDate = formData.get('expected_end_date') as string;

  if (!name || !status) {
    throw new Error('Project name and status are required.');
  }

  const { error } = await supabase.from('projects').insert({
    name,
    status,
    client_name: clientName || null,
    description: description || null,
    start_date: startDate || null,
    expected_end_date: expectedEndDate || null,
  });

  if (error) {
    throw new Error(`Save failed: ${error.message}`);
  }

  revalidatePath('/projects');
}
