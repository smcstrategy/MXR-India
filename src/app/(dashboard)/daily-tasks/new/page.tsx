import { supabase } from '@/lib/supabase';
import NewTaskForm from './NewTaskForm';

interface Project {
  id: number;
  name: string;
  status: string;
}

async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status')
    .order('status')
    .order('name');
  if (error) return [];
  return data ?? [];
}

export default async function NewDailyTaskPage() {
  const projects = await getProjects();
  return <NewTaskForm projects={projects} />;
}
