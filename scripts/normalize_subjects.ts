
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
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY']; // MUST use service role for deletions

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or SERVICE ROLE Key. Cannot perform admin operations.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The 13 Real Subjects
const TARGET_SUBJECTS = [
    { name: 'English', code: 'ENG', dept: 'LANG' },
    { name: 'Chichewa', code: 'CHI', dept: 'LANG' },
    { name: 'Mathematics', code: 'MATH', dept: 'MATH' },
    { name: 'Biology', code: 'BIO', dept: 'SCI' },
    { name: 'Chemistry', code: 'CHEM', dept: 'SCI' },
    { name: 'Physics', code: 'PHY', dept: 'SCI' },
    { name: 'Geography', code: 'GEO', dept: 'HUM' },
    { name: 'History', code: 'HIST', dept: 'HUM' },
    { name: 'Social and Developmental Studies', code: 'SDS', dept: 'HUM' },
    { name: 'Life Skills', code: 'LS', dept: 'HUM' },
    { name: 'Agriculture', code: 'AGR', dept: 'VOC' },
    { name: 'Computer Studies', code: 'CS', dept: 'VOC' },
    { name: 'Business Studies', code: 'BS', dept: 'COM' },
];

// Mapping for merging (Bad Code/Name -> Target Code)
const MERGE_MAP: Record<string, string> = {
    'MAT': 'MATH',
    'AMT': 'MATH', // Additional Math -> Math
    'CHE': 'CHEM',
    'PHY': 'PHY', // Self (just in case)
    'PSC': 'PHY', // Physical Science -> Physics (Approximation for now, or maybe split? sticking to 13)
    'COM': 'CS',  // Computer Studies (COM) -> CS
    'LIF': 'LS',
    'LFS': 'LS',
    'HIS': 'HIST',
    'BUS': 'BS',
    'CMM': 'BS', // Commerce -> Business Studies
    'ACC': 'BS', // Accounting -> Business Studies
    'SOS': 'SDS', // Social Studies -> SDS
    'LIT': 'ENG', // Literature -> English
    'BK': 'HIST', // Bible Knowledge -> History (Best fit? or just delete?) -> Let's map to History for now or leave unmapped to delete? 
    // Actually, let's map BK to History to save the enrollments, or maybe SDS? SDS seems safer for "moral/social" stuff.
    'WW': 'AGR', // Woodwork -> Agriculture (Vocational) - weak map, but user wants 13.
    'MW': 'AGR', // Metalwork -> Agriculture (Vocational)
    'TD': 'AGR', // Tech Drawing -> Agriculture (Vocational)
    'HE': 'AGR', // Home Economics -> Agriculture (Vocational)
    'CA': 'LS',  // Creative Arts -> Life Skills?
    'PA': 'LS',  // Performing Arts -> Life Skills?
};

async function normalize() {
    console.log('Starting Normalization...');

    // 1. Get Departments
    const { data: departments } = await supabase.from('departments').select('*');
    if (!departments) throw new Error('Failed to fetch departments');

    const deptMap = new Map(departments.map(d => [d.code, d.id]));

    // 2. Get All Subjects
    const { data: subjects } = await supabase.from('subjects').select('*');
    if (!subjects) throw new Error('Failed to fetch subjects');

    console.log(`Found ${subjects.length} total subjects.`);

    // 3. Identify Keepers and Others
    const keepers = new Map<string, any>(); // Code -> SubjectObj
    const toMerge = [];
    const toDelete = [];

    // First pass: Find the "Perfect" keepers (Name matches Target AND Dept matches Target)
    // Actually, let's just find the best candidate for each Target Code.

    for (const target of TARGET_SUBJECTS) {
        // Find exact match on Code
        let match = subjects.find(s => s.code === target.code);

        // If not found, find by Name
        if (!match) {
            match = subjects.find(s => s.name === target.name);
        }

        if (match) {
            keepers.set(target.code, { ...match, targetDept: target.dept });
        } else {
            console.error(`CRITICAL: Target subject ${target.name} (${target.code}) not found in DB! Creating it...`);
            // Create it if missing
            const deptId = deptMap.get(target.dept);
            const { data: newSub, error } = await supabase
                .from('subjects')
                .insert({ name: target.name, code: target.code, department_id: deptId })
                .select()
                .single();

            if (error) {
                console.error('Failed to create subject:', error);
                continue;
            }
            keepers.set(target.code, { ...newSub, targetDept: target.dept });
        }
    }

    // 4. Process all subjects
    for (const subject of subjects) {
        // Is it a keeper?
        const isKeeper = Array.from(keepers.values()).some(k => k.id === subject.id);
        if (isKeeper) continue;

        // Is it in the merge map?
        const targetCode = MERGE_MAP[subject.code];
        if (targetCode) {
            const targetSubject = keepers.get(targetCode);
            if (targetSubject) {
                toMerge.push({ from: subject, to: targetSubject });
            } else {
                console.warn(`Subject ${subject.name} (${subject.code}) maps to ${targetCode} but target not found.`);
                toDelete.push(subject);
            }
        } else {
            // Not a keeper, not in map -> Delete
            console.warn(`Subject ${subject.name} (${subject.code}) has no mapping. Marking for deletion.`);
            toDelete.push(subject);
        }
    }

    console.log(`Keepers: ${keepers.size}`);
    console.log(`To Merge: ${toMerge.length}`);
    console.log(`To Delete: ${toDelete.length}`);

    // 5. Execute Merges
    for (const { from, to } of toMerge) {
        console.log(`Merging ${from.name} (${from.code}) -> ${to.name} (${to.code})`);

        // Update Enrollments (student_subjects)
        // We need to handle conflicts (if student already has the target subject)
        // Strategy: Update where possible, delete where conflict.

        // Step A: Find conflicts
        // We can't easily do "UPDATE ... ON CONFLICT" in one go via JS client without raw SQL or stored proc.
        // But we can try updating and catch errors, or just delete the 'from' rows if 'to' rows exist.

        // Let's use a raw SQL approach for atomicity if possible, but client is limited.
        // We'll try to update all 'from' to 'to'.

        // Fetch all enrollments for 'from' subject
        const { data: enrollments } = await supabase
            .from('student_subjects')
            .select('id, student_id, academic_year_id, term_id')
            .eq('subject_id', from.id);

        if (enrollments && enrollments.length > 0) {
            for (const enrollment of enrollments) {
                // Check if 'to' enrollment exists
                const { data: existing } = await supabase
                    .from('student_subjects')
                    .select('id')
                    .eq('student_id', enrollment.student_id)
                    .eq('subject_id', to.id)
                    .eq('academic_year_id', enrollment.academic_year_id)
                    .eq('term_id', enrollment.term_id || 0) // Handle null term?
                    .maybeSingle(); // Use maybeSingle to avoid error if 0 or >1

                if (existing) {
                    // Conflict: Delete the 'from' enrollment
                    await supabase.from('student_subjects').delete().eq('id', enrollment.id);
                } else {
                    // No conflict: Move it
                    await supabase.from('student_subjects').update({ subject_id: to.id }).eq('id', enrollment.id);
                }
            }
        }

        // Update Teacher Subjects
        // Similar logic
        const { data: tSubjects } = await supabase.from('teacher_subjects').select('id, teacher_id').eq('subject_id', from.id);
        if (tSubjects) {
            for (const ts of tSubjects) {
                const { data: existing } = await supabase.from('teacher_subjects').select('id').eq('teacher_id', ts.teacher_id).eq('subject_id', to.id).maybeSingle();
                if (existing) {
                    await supabase.from('teacher_subjects').delete().eq('id', ts.id);
                } else {
                    await supabase.from('teacher_subjects').update({ subject_id: to.id }).eq('id', ts.id);
                }
            }
        }

        // Update Curriculum Subjects
        const { data: cSubjects } = await supabase.from('curriculum_subjects').select('id, level, stream').eq('subject_id', from.id);
        if (cSubjects) {
            for (const cs of cSubjects) {
                // Check conflict
                const { data: existing } = await supabase.from('curriculum_subjects').select('id').eq('subject_id', to.id).eq('level', cs.level).eq('stream', cs.stream || 'NULL').maybeSingle(); // Stream can be null
                if (existing) {
                    await supabase.from('curriculum_subjects').delete().eq('id', cs.id);
                } else {
                    await supabase.from('curriculum_subjects').update({ subject_id: to.id }).eq('id', cs.id);
                }
            }
        }

        // Finally, delete the 'from' subject
        const { error: delError } = await supabase.from('subjects').delete().eq('id', from.id);
        if (delError) console.error(`Error deleting subject ${from.name}:`, delError);
    }

    // 6. Delete the "To Delete" subjects
    for (const subject of toDelete) {
        console.log(`Deleting ${subject.name} (${subject.code})...`);
        // This might fail if there are still FK references I missed (e.g. exam_results?). 
        // If so, we should probably cascade or just log error.
        const { error } = await supabase.from('subjects').delete().eq('id', subject.id);
        if (error) console.error(`Failed to delete ${subject.name}:`, error);
    }

    // 7. Fix Departments for Keepers
    for (const code of keepers.keys()) {
        const keeper = keepers.get(code);
        const targetDeptCode = keeper.targetDept;
        const targetDeptId = deptMap.get(targetDeptCode);

        if (keeper.department_id !== targetDeptId) {
            console.log(`Fixing department for ${keeper.name}: ${keeper.department_id} -> ${targetDeptId}`);
            await supabase.from('subjects').update({ department_id: targetDeptId }).eq('id', keeper.id);
        }
    }

    console.log('Normalization Complete.');
}

normalize();
