const SUPABASE_URL = 'https://ozmticxpqnnaqnjypmgg.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXRpY3hwcW5uYXFuanlwbWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY0NjE0MCwiZXhwIjoyMDkyMjIyMTQwfQ.ufDC_kEaBWVp4P7aTnxQDoHQgNu-OzYTydC9G_Yjapk';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// 1. List all users
const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers });
const { users } = await listRes.json();

// 2. Delete Ravi Kumar
const ravi = users.find(u => u.user_metadata?.full_name === 'Ravi Kumar');
if (ravi) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${ravi.id}`, { method: 'DELETE', headers });
  console.log(`Deleted: ${ravi.email}`);
} else {
  console.log('Ravi Kumar not found');
}

// 3. Delete old demo tasks for the example employee
await fetch(`${SUPABASE_URL}/rest/v1/daily_tasks?employee_name=eq.Priya Sharma`, {
  method: 'DELETE',
  headers: { ...headers, 'Prefer': 'return=minimal' },
});

// 4. Create example account
const existing = users.find(u => u.email === 'priya@mxrobotics.co.kr');
let demoUserId = existing?.id;

if (!existing) {
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'priya@mxrobotics.co.kr',
      password: '111111',
      email_confirm: true,
      user_metadata: { full_name: 'Priya Sharma', role: 'user', approved: true },
    }),
  });
  const created = await createRes.json();
  demoUserId = created.id;
  console.log(`Created demo user: ${created.email}`);
} else {
  // Ensure approved
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${demoUserId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ user_metadata: { full_name: 'Priya Sharma', role: 'user', approved: true } }),
  });
  console.log('Demo user already exists, ensured approved');
}

// 5. Insert sample daily task for today
const today = new Date().toISOString().split('T')[0];
const taskRes = await fetch(`${SUPABASE_URL}/rest/v1/daily_tasks`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'return=minimal' },
  body: JSON.stringify({
    task_date: today,
    employee_name: 'Priya Sharma',
    project_name: 'Smart Factory Automation',
    task_category: 'Development',
    hours_spent: 7,
    accomplishments: 'Completed PLC communication module integration with the HMI dashboard. Tested data sync between sensor nodes and central server.',
    blockers: null,
    tomorrow_plan: 'Begin QA testing for the PLC module and document API endpoints.',
    priority: 'High',
    status: 'Submitted',
  }),
});

console.log(`Task insert status: ${taskRes.status}`);
console.log('Done.');
