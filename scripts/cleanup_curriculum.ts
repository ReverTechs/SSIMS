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
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or SERVICE ROLE Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupCurriculum() {
    console.log('Starting Curriculum Cleanup...');

    // 1. Get all curriculum entries
    const { data: allEntries, error: fetchError } = await supabase
        .from('curriculum_subjects')
        .select('*');

    if (fetchError) {
        console.error('Error fetching curriculum:', fetchError);
        return;
    }

    console.log(`Found ${allEntries.length} total curriculum entries`);

    // 2. Delete ALL curriculum entries (we'll recreate them properly)
    const { error: deleteError } = await supabase
        .from('curriculum_subjects')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('Error deleting curriculum:', deleteError);
        return;
    }

    console.log('Deleted all curriculum entries');

    // 3. Get current subject IDs
    const { data: subjects } = await supabase.from('subjects').select('id, code');
    const subjectMap = new Map(subjects?.map(s => [s.code, s.id]) || []);

    // 4. Recreate curriculum properly
    const curriculumEntries = [];

    // JUNIOR (Form 1-2) - 10 compulsory subjects
    const juniorSubjects = [
        { code: 'MATH', category: 'core' },
        { code: 'ENG', category: 'core' },
        { code: 'CHI', category: 'core' },
        { code: 'BIO', category: 'sciences' },
        { code: 'CHEM', category: 'sciences' },
        { code: 'PHY', category: 'sciences' },
        { code: 'GEO', category: 'humanities' },
        { code: 'HIST', category: 'humanities' },
        { code: 'AGR', category: 'technical' },
        { code: 'LS', category: 'core' },
    ];

    for (const subj of juniorSubjects) {
        const subjectId = subjectMap.get(subj.code);
        if (subjectId) {
            curriculumEntries.push({
                subject_id: subjectId,
                level: 'junior',
                stream: null,
                is_compulsory: true,
                category: subj.category,
            });
        } else {
            console.warn(`Subject ${subj.code} not found`);
        }
    }

    // SENIOR (Form 3-4) - Core subjects (all streams)
    const seniorCoreSubjects = [
        { code: 'ENG', category: 'core' },
        { code: 'MATH', category: 'core' },
        { code: 'CHI', category: 'core' },
        { code: 'BIO', category: 'sciences' },
        { code: 'LS', category: 'core' },
    ];

    for (const subj of seniorCoreSubjects) {
        const subjectId = subjectMap.get(subj.code);
        if (subjectId) {
            curriculumEntries.push({
                subject_id: subjectId,
                level: 'senior',
                stream: null,
                is_compulsory: true,
                category: subj.category,
            });
        }
    }

    // SENIOR - Sciences Stream
    const sciencesStream = [
        { code: 'PHY', category: 'sciences' },
        { code: 'CHEM', category: 'sciences' },
        { code: 'CS', category: 'technical' },
    ];

    for (const subj of sciencesStream) {
        const subjectId = subjectMap.get(subj.code);
        if (subjectId) {
            curriculumEntries.push({
                subject_id: subjectId,
                level: 'senior',
                stream: 'sciences',
                is_compulsory: false,
                category: subj.category,
            });
        }
    }

    // SENIOR - Humanities Stream
    const humanitiesStream = [
        { code: 'HIST', category: 'humanities' },
        { code: 'GEO', category: 'humanities' },
        { code: 'SDS', category: 'humanities' },
    ];

    for (const subj of humanitiesStream) {
        const subjectId = subjectMap.get(subj.code);
        if (subjectId) {
            curriculumEntries.push({
                subject_id: subjectId,
                level: 'senior',
                stream: 'humanities',
                is_compulsory: false,
                category: subj.category,
            });
        }
    }

    // SENIOR - Commercial Stream
    const commercialStream = [
        { code: 'BS', category: 'commercial' },
    ];

    for (const subj of commercialStream) {
        const subjectId = subjectMap.get(subj.code);
        if (subjectId) {
            curriculumEntries.push({
                subject_id: subjectId,
                level: 'senior',
                stream: 'commercial',
                is_compulsory: false,
                category: subj.category,
            });
        }
    }

    // 5. Insert new curriculum entries
    const { error: insertError } = await supabase
        .from('curriculum_subjects')
        .insert(curriculumEntries);

    if (insertError) {
        console.error('Error inserting curriculum:', insertError);
        return;
    }

    console.log(`Successfully created ${curriculumEntries.length} curriculum entries`);
    console.log(`  Junior: 10 compulsory subjects`);
    console.log(`  Senior Core: 5 compulsory subjects`);
    console.log(`  Senior Sciences: 3 optional subjects`);
    console.log(`  Senior Humanities: 3 optional subjects`);
    console.log(`  Senior Commercial: 1 optional subject`);
    console.log('Cleanup Complete!');
}

cleanupCurriculum();
