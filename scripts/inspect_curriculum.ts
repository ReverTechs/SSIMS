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
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            envVars[key] = value;
        }
    });
} catch (e) {
    console.error('Could not read .env.local:', e);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    let output = '';
    const log = (msg: string) => { output += msg + '\n'; console.log(msg); };

    log('--- Curriculum Subjects ---');
    const { data: curriculum, error: currError } = await supabase
        .from('curriculum_subjects')
        .select('*, subjects(name, code)');

    if (currError) log('Error fetching curriculum: ' + JSON.stringify(currError));
    else {
        log(`Total Curriculum Entries: ${curriculum?.length || 0}`);

        // Group by level
        const junior = curriculum?.filter(c => c.level === 'junior') || [];
        const senior = curriculum?.filter(c => c.level === 'senior') || [];

        log(`\nJunior (Form 1-2): ${junior.length} entries`);
        junior.forEach(c => {
            log(`  ${c.subjects?.name || 'NULL'} (${c.subjects?.code || 'NULL'}) | ${c.is_compulsory ? 'Compulsory' : 'Optional'} | ${c.category}`);
        });

        log(`\nSenior (Form 3-4): ${senior.length} entries`);
        const seniorNoStream = senior.filter(s => !s.stream);
        const seniorSciences = senior.filter(s => s.stream === 'sciences');
        const seniorHumanities = senior.filter(s => s.stream === 'humanities');
        const seniorCommercial = senior.filter(s => s.stream === 'commercial');

        log(`  No Stream (Core): ${seniorNoStream.length}`);
        seniorNoStream.forEach(c => {
            log(`    ${c.subjects?.name || 'NULL'} (${c.subjects?.code || 'NULL'}) | ${c.is_compulsory ? 'Compulsory' : 'Optional'}`);
        });

        log(`  Sciences Stream: ${seniorSciences.length}`);
        seniorSciences.forEach(c => {
            log(`    ${c.subjects?.name || 'NULL'} (${c.subjects?.code || 'NULL'}) | ${c.is_compulsory ? 'Compulsory' : 'Optional'}`);
        });

        log(`  Humanities Stream: ${seniorHumanities.length}`);
        seniorHumanities.forEach(c => {
            log(`    ${c.subjects?.name || 'NULL'} (${c.subjects?.code || 'NULL'}) | ${c.is_compulsory ? 'Compulsory' : 'Optional'}`);
        });

        log(`  Commercial Stream: ${seniorCommercial.length}`);
        seniorCommercial.forEach(c => {
            log(`    ${c.subjects?.name || 'NULL'} (${c.subjects?.code || 'NULL'}) | ${c.is_compulsory ? 'Compulsory' : 'Optional'}`);
        });

        // Check for NULL subjects (broken references)
        const nullSubjects = curriculum?.filter(c => !c.subjects) || [];
        if (nullSubjects.length > 0) {
            log(`\n⚠️  WARNING: ${nullSubjects.length} curriculum entries with NULL subjects (broken references)`);
            nullSubjects.forEach(c => {
                log(`    ID: ${c.id} | Level: ${c.level} | Stream: ${c.stream || 'NULL'} | Subject ID: ${c.subject_id}`);
            });
        }
    }

    fs.writeFileSync('scripts/curriculum_output.txt', output);
}

inspect();
