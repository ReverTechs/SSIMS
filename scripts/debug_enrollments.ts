
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env.local
try {
    const envConfig = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
            process.env[key.trim()] = value;
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    console.log("URL:", supabaseUrl ? "Set" : "Missing");
    console.log("Service Key:", supabaseServiceKey ? "Set" : "Missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log("Fetching a student ID from enrollments table...");
    const { data: enrollmentSample, error: sampleError } = await supabase
        .from("enrollments")
        .select("student_id")
        .limit(1);

    if (sampleError) {
        console.error("Error fetching enrollment sample:", sampleError);
        return;
    }

    if (!enrollmentSample || enrollmentSample.length === 0) {
        console.log("No enrollments found in the entire table.");
        return;
    }

    const studentId = enrollmentSample[0].student_id;
    console.log(`Testing with student ID: ${studentId}`);

    console.log("Fetching enrollments with the NEW FIXED query (no sort)...");
    const { data: enrollments, error: enrollmentError } = await supabase
        .from("enrollments")
        .select(
            `
      id,
      status,
      academic_year:academic_years (
        name,
        start_date,
        end_date,
        is_active
      ),
      class:classes (
        name
      )
    `
        )
        .eq("student_id", studentId);
    // .order("academic_year(start_date)", { ascending: false }); // REMOVED

    if (enrollmentError) {
        console.error("Error fetching enrollments:", enrollmentError);
    } else {
        // Mimic the client-side sort
        const sortedData = (enrollments as any[]).sort((a, b) => {
            const dateA = new Date(a.academic_year?.start_date || 0).getTime();
            const dateB = new Date(b.academic_year?.start_date || 0).getTime();
            return dateB - dateA; // Descending order (newest first)
        });

        console.log("Enrollments found (sorted client-side):", sortedData.length);
        if (sortedData.length > 0) {
            console.log("First enrollment year:", sortedData[0].academic_year?.name);
        }
    }
}

main();
