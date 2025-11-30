
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envVars: Record<string, string> = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key] = value;
    }
  });
} catch (e) {
  console.error('Could not read .env.local:', e);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

console.log('URL found:', !!supabaseUrl);
console.log('Key found:', !!supabaseKey);
console.log('Using Service Role Key:', !!envVars['SUPABASE_SERVICE_ROLE_KEY']);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  let output = '';
  const log = (msg: string) => { output += msg + '\n'; console.log(msg); };

  log('--- Departments ---');
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*');

  if (deptError) log('Error fetching departments: ' + JSON.stringify(deptError));
  else {
    log(`Total Departments: ${departments?.length || 0}`);
    departments?.forEach(d => log(`${d.id} | ${d.name} | ${d.code}`));
  }

  log('\n--- Subjects ---');
  const { data: subjects, error: subjError } = await supabase
    .from('subjects')
    .select('*, departments(name)');

  if (subjError) log('Error fetching subjects: ' + JSON.stringify(subjError));
  else {
    log(`Total Subjects: ${subjects?.length || 0}`);
    if (subjects && subjects.length > 0) {
      subjects.forEach(s => {
        log(`${s.id} | ${s.name} | ${s.code} | ${s.departments?.name || 'N/A'} | ${s.department_id}`);
      });
    }
  }

  fs.writeFileSync('scripts/output.txt', output);
}

inspect();
