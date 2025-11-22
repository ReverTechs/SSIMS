# Teacher Profile Database Setup Instructions

This document contains all the SQL queries you need to run in the Supabase SQL Editor to set up the teacher profile system with Malawi secondary school departments and subjects.

## Prerequisites

Make sure you have already run the migration file:
- `supabase/migrations/20251122_create_teacher_schema.sql`

## Step-by-Step Setup

### Step 1: Populate Departments

Run the query from `supabase/populate_departments.sql`:

```sql
-- Query 1: Populate Departments for Malawi Secondary Schools
INSERT INTO public.departments (name, code) VALUES
('Languages', 'LANG'),
('Sciences', 'SCI'),
('Humanities', 'HUM'),
('Mathematics', 'MATH'),
('Vocational/Technical', 'VOC'),
('Commerce/Business', 'COM'),
('Arts', 'ARTS')
ON CONFLICT (name) DO NOTHING;

-- Verify departments were inserted
SELECT id, name, code FROM public.departments ORDER BY name;
```

**Expected Result:** 7 departments should be inserted.

---

### Step 2: Populate Subjects

Run the query from `supabase/populate_subjects.sql`. This will insert all subjects for Malawi secondary schools organized by department.

**Expected Result:** 20 subjects should be inserted across all departments.

---

### Step 3: Create Teacher Profile View (Optional)

Run the query from `supabase/create_teacher_profile_view.sql` to create a view that aggregates teacher data.

**Note:** This is optional but can be useful for reporting and analytics.

---

### Step 4: Create Teacher Profile Function (Optional)

Run the query from `supabase/create_teacher_profile_function.sql` to create a function that retrieves teacher profile data.

**Note:** This is optional. The application uses direct queries instead.

---

## Verification Queries

After running the setup queries, you can verify the data with these queries:

### Check Departments
```sql
SELECT id, name, code FROM public.departments ORDER BY name;
```

### Check Subjects
```sql
SELECT s.id, s.name, s.code, d.name as department_name
FROM public.subjects s
LEFT JOIN public.departments d ON s.department_id = d.id
ORDER BY d.name, s.name;
```

### Check Teacher Profile (if you have teachers)
```sql
-- Replace 'teacher-uuid-here' with an actual teacher UUID
SELECT * FROM get_teacher_profile('teacher-uuid-here');
```

---

## Subject List by Department

### Languages Department
- English
- Chichewa

### Sciences Department
- Biology
- Chemistry
- Physical Science

### Humanities Department
- History
- Geography
- Social and Developmental Studies
- Life Skills

### Mathematics Department
- Mathematics

### Vocational/Technical Department
- Agriculture
- Home Economics
- Woodwork
- Metalwork
- Technical Drawing
- Computer Studies

### Commerce/Business Department
- Business Studies

### Arts Department
- Creative Arts
- Performing Arts

---

## Next Steps

1. After running the setup queries, teachers can be assigned to departments, subjects, and classes.
2. The teacher profile pages will automatically display data from the database.
3. Make sure teachers have entries in both the `profiles` and `teachers` tables.
4. Link teachers to subjects using the `teacher_subjects` junction table.
5. Link teachers to classes using the `teacher_classes` junction table.

---

## Troubleshooting

### If departments don't insert:
- Check if the departments table exists
- Verify you have INSERT permissions
- Check for any constraint violations

### If subjects don't insert:
- Make sure departments were inserted first
- Verify the department codes match exactly
- Check foreign key constraints

### If teacher profile doesn't show data:
- Verify the teacher exists in both `profiles` and `teachers` tables
- Check that subjects and classes are linked via junction tables
- Ensure RLS policies allow reading the data

