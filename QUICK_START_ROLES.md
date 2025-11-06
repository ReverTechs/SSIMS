# Quick Start: How to Enter as Different Roles

## 🚀 Quick Steps to Test Different Roles

### Step 1: Set Up Database (One Time)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `supabase/migrations/001_create_user_profiles.sql`
3. Paste and click **Run**

✅ This creates the `user_profiles` table that stores roles.

### Step 2: Sign Up with a Role

1. Go to `/auth/sign-up`
2. Fill in:
   - Full Name
   - Email
   - **Select Role** (dropdown - choose any role you want to test)
   - Password
3. Click **Sign up**

✅ Your account is created with the selected role!

### Step 3: Manually Change Role (For Testing)

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `user_profiles` table
3. Find your user (search by email)
4. Click the row to edit
5. Change `role` field to: `student`, `teacher`, `headteacher`, `deputy_headteacher`, `guardian`, or `admin`
6. Click **Save**

**Option B: Via SQL (Fast)**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this (replace email and role):

```sql
UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@example.com';
```

### Step 4: Test the Role

1. **Log out** (if logged in)
2. **Log in** with your account
3. You'll see different menu items in the sidebar based on your role!

## 📋 Available Roles

| Role | Description |
|------|-------------|
| `student` | For students |
| `teacher` | For regular teachers |
| `headteacher` | For headteachers |
| `deputy_headteacher` | For deputy headteachers |
| `guardian` | For parents/guardians |
| `admin` | For administrators |

## 🔍 How to Check Your Current Role

### In Supabase Dashboard:
```sql
SELECT email, full_name, role FROM user_profiles WHERE email = 'your-email@example.com';
```

### In Your Code:
The dashboard automatically shows your role. The sidebar menu changes based on your role.

## 🎯 Example: Create Test Accounts

1. **Sign up** as `admin@test.com` → Select role: **Admin**
2. **Sign up** as `teacher@test.com` → Select role: **Teacher**
3. **Sign up** as `student@test.com` → Select role: **Student**

Then log in with each to see different dashboards!

## ⚡ Quick SQL Commands

**View all users:**
```sql
SELECT email, full_name, role FROM user_profiles;
```

**Change role:**
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';
```

**Find users by role:**
```sql
SELECT * FROM user_profiles WHERE role = 'admin';
```

## 📚 Full Documentation

See `ROLE_MANAGEMENT_GUIDE.md` for complete details on:
- Database schema
- Security policies
- Code examples
- Troubleshooting

## 🎓 Understanding the Flow

```
Sign Up → Select Role → Stored in user_profiles table
   ↓
Login → Fetch role from database → Show role-specific UI
   ↓
Change Role (manually) → Update user_profiles → Logout/Login → New UI
```

## 💡 Pro Tips

1. **For testing:** Create multiple accounts with different emails, each with a different role
2. **For production:** Remove role selection from sign-up form and assign roles manually via admin panel
3. **Quick role switch:** Use SQL to change roles instantly without re-signing up

---

**That's it!** You now have full control over user roles. 🎉



