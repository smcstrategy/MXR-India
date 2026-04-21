'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export async function createDailyTask(formData: FormData) {
  const taskDate = formData.get('task_date') as string;
  const employeeName = formData.get('employee_name') as string;
  const projectSelect = formData.get('project_name') as string;
  const projectCustom = formData.get('project_name_custom') as string;
  const projectName = projectSelect === '__other__' ? projectCustom : projectSelect;
  const taskCategory = formData.get('task_category') as string;
  const hoursSpent = formData.get('hours_spent') as string;
  const accomplishments = formData.get('accomplishments') as string;
  const blockers = formData.get('blockers') as string;
  const tomorrowPlan = formData.get('tomorrow_plan') as string;
  const priority = formData.get('priority') as string;

  if (!taskDate || !employeeName || !projectName || !accomplishments) {
    throw new Error('Required fields are missing.');
  }

  const { error } = await supabase.from('daily_tasks').insert({
    task_date: taskDate,
    employee_name: employeeName,
    project_name: projectName,
    task_category: taskCategory || 'General',
    hours_spent: hoursSpent ? parseFloat(hoursSpent) : null,
    accomplishments,
    blockers: blockers || null,
    tomorrow_plan: tomorrowPlan || null,
    priority: priority || 'Medium',
    status: 'Submitted',
  });

  if (error) {
    throw new Error(`Failed to save task: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/reports');
  redirect('/');
}
