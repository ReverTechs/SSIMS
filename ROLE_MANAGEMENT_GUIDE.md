# Role Management Guide

This guide explains how the role-based authentication system works and how you can manually set user roles.

## Understanding the Role System

Your application supports the following roles:
- `student` - For students
- `teacher` - For regular teachers
- `headteacher` - For headteachers
- `deputy_headteacher` - For deputy headteachers
- `guardian` - For parents/guardians
- `admin` - For administrators

## Database Setup

### Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_user_profiles.sql`
4. Click **Run** to execute the migration

This will create:
- `user_profiles` table to store user roles
- Automatic trigger to create profiles when users sign up
- Row Level Security (RLS) policies for data protection

### Step 2: Verify the Table

After running the migration, check that the table exists:
- Go to **Table Editor** in Supabase
- You should see `user_profiles` table with columns: `id`, `email`, `full_name`, `role`, `avatar`, `created_at`, `updated_at`

## How Roles Work

### During Sign-Up

When a user signs up:
1. They select their role from a dropdown
2. The role is stored in `user_profiles` table
3. The role is also saved in `auth.users` metadata for quick access

### During Login

When a user logs in:
1. The system fetches their profile from `user_profiles` table
2. The role determines what they can see in the dashboard
3. Different sidebar menus appear based on role

## Manual Role Assignment (3 Methods)

### Method 1: Using Supabase Dashboard (Easiest)

**For existing users:**

1. Go to **Supabase Dashboard** → **Table Editor**
2. Select `user_profiles` table
3. Find the user you want to update (search by email)
4. Click on the row to edit
5. Change the `role` field to one of:
   - `student`
   - `teacher`
   - `headteacher`
   - `deputy_headteacher`
   - `guardian`
   - `admin`
6. Click **Save**

**For new users (before they sign up):**

You can't pre-assign roles before sign-up, but you can change them immediately after.

### Method 2: Using SQL Editor (Fast for Multiple Users)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query to change a user's role by email:

```sql
UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'user@example.com';
```

3. To change multiple users at once:

```sql
-- Make all users with specific emails admins
UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email IN ('admin1@example.com', 'admin2@example.com');
```

4. To see all users and their roles:

```sql
SELECT id, email, full_name, role, created_at
FROM user_profiles
ORDER BY created_at DESC;
```

### Method 3: Using Your Application Code

You can create an admin page or API route to change roles. Here's an example:

```typescript
import { updateUserRole } from "@/lib/supabase/user";

// In your admin page or API route
async function changeUserRole(userId: string, newRole: UserRole) {
  const result = await updateUserRole(userId, newRole);
  if (result.success) {
    console.log("Role updated successfully");
  } else {
    console.error("Error:", result.error);
  }
}
```

## Testing Different Roles

### Quick Test Setup

1. **Create test accounts:**
   - Sign up with different emails for each role
   - Or manually change roles in Supabase dashboard

2. **Test each role:**
   - Log in with each account
   - Verify the sidebar shows correct menu items
   - Check that role-specific pages are accessible

### Example Test Users

You can create these test accounts:

```sql
-- After creating users via sign-up, update their roles:
UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE user_profiles SET role = 'teacher' WHERE email = 'teacher@test.com';
UPDATE user_profiles SET role = 'student' WHERE email = 'student@test.com';
UPDATE user_profiles SET role = 'headteacher' WHERE email = 'head@test.com';
UPDATE user_profiles SET role = 'guardian' WHERE email = 'guardian@test.com';
```

## How to Check Current User Role

### In Server Components

```typescript
import { getCurrentUser } from "@/lib/supabase/user";

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  console.log("Current role:", user.role);
  // user.role will be: "student" | "teacher" | "headteacher" | etc.
}
```

### In Client Components

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function MyComponent() {
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setRole(data.role);
        }
      }
    }
    fetchRole();
  }, []);

  return <div>Your role: {role}</div>;
}
```

## Role-Based Access Control

The sidebar automatically shows/hides menu items based on role. This is configured in `components/dashboard/sidebar.tsx`.

To add role restrictions to pages:

```typescript
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";

export default async function AdminOnlyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Only allow admins
  if (user.role !== "admin") {
    redirect("/dashboard"); // or show error
  }

  return <div>Admin content</div>;
}
```

## Troubleshooting

### User doesn't have a role

If a user signs up but doesn't get a role:
1. Check if the migration was run
2. Check if the trigger exists: `on_auth_user_created`
3. Manually create the profile:

```sql
INSERT INTO user_profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email), 'student'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);
```

### Role not updating

1. Check RLS policies - make sure you have permission to update
2. Verify the role value is one of the allowed values
3. Check browser console for errors

### Can't see role-specific content

1. Verify the user's role in `user_profiles` table
2. Clear browser cache and cookies
3. Log out and log back in to refresh the session

## Security Notes

⚠️ **Important:**
- The RLS policies allow users to update their own profiles, but you should restrict role changes to admins only
- Consider adding a server-side check before allowing role updates
- In production, remove role selection from sign-up form and assign roles manually

## Next Steps

1. ✅ Run the database migration
2. ✅ Test sign-up with different roles
3. ✅ Manually change roles in Supabase dashboard
4. ✅ Test login with different roles
5. ✅ Verify role-based UI changes work correctly

## Quick Reference

**Change role via SQL:**
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';
```

**View all users and roles:**
```sql
SELECT email, full_name, role FROM user_profiles;
```

**Get current user in code:**
```typescript
const user = await getCurrentUser();
console.log(user?.role);
```



