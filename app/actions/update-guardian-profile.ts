"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateGuardianSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    occupation: z.string().optional(),
    workplace: z.string().optional(),
    workPhone: z.string().optional(),
});

export async function updateGuardianProfile(data: any) {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Unauthorized" };
    }

    const validatedFields = updateGuardianSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            error: "Validation failed",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const {
        firstName,
        lastName,
        phoneNumber,
        address,
        occupation,
        workplace,
        workPhone,
    } = validatedFields.data;

    // Update profile (name)
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`, // Assuming full_name exists or is generated
        })
        .eq("id", user.id);

    if (profileError) {
        console.error("Profile update error:", profileError);
        return { error: "Failed to update profile details" };
    }

    // Update guardian details
    const { error: guardianError } = await supabase
        .from("guardians")
        .update({
            phone_number: phoneNumber,
            address: address,
            occupation: occupation,
            workplace: workplace,
            work_phone: workPhone,
        })
        .eq("id", user.id);

    if (guardianError) {
        console.error("Guardian update error:", guardianError);
        return { error: "Failed to update guardian details" };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}
