import { supabase } from '@/lib/supabase';
import NewTaskForm from '../../new/NewTaskForm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status')
    .order('status')
    .order('name');
  if (error) return [];
  return data ?? [];
}

async function getTask(id: string) {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data;
}

export default async function EditDailyTaskPage({ params }: Props) {
  const { id } = await params;
  const [projects, task] = await Promise.all([
    getProjects(),
    getTask(id)
  ]);

  if (!task) {
    notFound();
  }

  return <NewTaskForm projects={projects} initialData={task} />;
}
