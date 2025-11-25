# Guardian System - Dual-Role Support Documentation

## Overview

The Guardian system is designed to handle real-world scenarios where users can have multiple roles simultaneously. For example, a teacher who is also a parent/guardian of students at the same school.

## Architecture

### Database Design

```
auth.users (Supabase Auth)
    ↓
profiles (id, email, first_name, last_name, role)
    ↓
    ├─→ teachers (id references profiles.id)
    ├─→ students (id references profiles.id)
    └─→ guardians (id references profiles.id)
```

**Key Points:**
- One user = One auth account + One profile
- A user can have records in multiple role tables (teachers AND guardians)
- No data duplication (name/email stored only in profiles)
- Profile has a primary role, but user can have additional role records

### Example Scenario: Teacher-Guardian

**John Doe** is a Math teacher and also a parent of two students:

```sql
-- One auth user
auth.users: { id: 'user-123', email: 'john.doe@school.com' }

-- One profile (primary role: teacher)
profiles: { 
  id: 'user-123', 
  email: 'john.doe@school.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'teacher'
}

-- Teacher record
teachers: { 
  id: 'user-123',
  department_id: 'math-dept',
  ...
}

-- Guardian record (SAME user ID!)
guardians: { 
  id: 'user-123',
  phone_number: '+265991234567',
  occupation: 'Teacher',
  ...
}

-- Links to his children
student_guardians: [
  { student_id: 'child-1', guardian_id: 'user-123', relationship: 'father', is_primary: true },
  { student_id: 'child-2', guardian_id: 'user-123', relationship: 'father', is_primary: true }
]
```

## Usage Examples

### 1. Check if User Has Multiple Roles

```typescript
import { getUserRoles, hasDualRole } from '@/lib/utils/role-utils';

// Get all roles for a user
const roles = await getUserRoles(userId);
// Returns: ['teacher', 'guardian']

// Check if user has dual role
const isDualRole = await hasDualRole(userId);
// Returns: true
```

### 2. Display Appropriate Dashboard

```typescript
import { isTeacher, isGuardian } from '@/lib/utils/role-utils';

const userId = session.user.id;

// Check roles
const hasTeacherRole = await isTeacher(userId);
const hasGuardianRole = await isGuardian(userId);

// Show appropriate UI
if (hasTeacherRole) {
  // Show teacher dashboard, classes, subjects, etc.
}

if (hasGuardianRole) {
  // Show guardian dashboard, children info, fees, etc.
}
```

### 3. Get Guardian's Students

```typescript
import { getGuardianStudents } from '@/lib/utils/role-utils';

// Get all students for a guardian (including their own children)
const students = await getGuardianStudents(guardianId);

students.forEach(studentGuardian => {
  console.log(`Student: ${studentGuardian.students.profiles.first_name}`);
  console.log(`Relationship: ${studentGuardian.relationship}`);
  console.log(`Can pickup: ${studentGuardian.can_pickup}`);
});
```

### 4. Get Student's Guardians

```typescript
import { getStudentGuardians, getPrimaryGuardian } from '@/lib/utils/role-utils';

// Get all guardians for a student
const guardians = await getStudentGuardians(studentId);

// Get only the primary guardian
const primaryGuardian = await getPrimaryGuardian(studentId);
```

### 5. Check Guardian Permissions

```typescript
import { canGuardianPerformAction } from '@/lib/utils/role-utils';

// Check if guardian can pick up student
const canPickup = await canGuardianPerformAction(guardianId, studentId, 'pickup');

// Check if guardian is responsible for fees
const isFinanciallyResponsible = await canGuardianPerformAction(guardianId, studentId, 'financial');

// Check if guardian is emergency contact
const isEmergencyContact = await canGuardianPerformAction(guardianId, studentId, 'emergency');
```

## Database Indexes

The system uses **13 optimized indexes** for performance:

### Filtered Indexes (Smaller, Faster)
- `idx_guardians_phone` - Only non-null phone numbers
- `idx_guardians_national_id` - Only non-null national IDs
- `idx_guardians_emergency` - Only emergency contacts
- `idx_student_guardians_primary` - Only primary guardians
- `idx_student_guardians_financial` - Only financially responsible guardians
- `idx_student_guardians_pickup` - Only authorized pickup persons

### Composite Indexes (Multi-column queries)
- `idx_student_guardians_primary` - (student_id, guardian_id) WHERE is_primary
- `idx_student_guardians_emergency` - (student_id, guardian_id) WHERE is_emergency_contact

### Standard Indexes
- `idx_student_guardians_student_id` - Fast guardian lookup per student
- `idx_student_guardians_guardian_id` - Fast student lookup per guardian
- `idx_student_guardians_relationship` - Filter by relationship type

## Constraints

### Unique Constraint: One Primary Guardian Per Student
```sql
CREATE UNIQUE INDEX idx_student_one_primary_guardian 
    ON student_guardians(student_id) 
    WHERE is_primary = true;
```

This ensures each student has exactly ONE primary guardian.

### Unique Constraint: National ID
```sql
national_id TEXT UNIQUE
```

Prevents duplicate guardian registrations with the same national ID.

## Helper Function

### Database Function: `is_guardian(user_id)`

```sql
SELECT public.is_guardian('user-123');
-- Returns: true/false
```

Use this in SQL queries to check if a user has a guardian record.

## Best Practices

### 1. Always Check Multiple Roles
Don't assume a user has only one role. Always check for additional roles.

### 2. Use Helper Functions
Use the provided role utility functions instead of writing raw queries.

### 3. Display Role-Specific Features
Show features based on what roles the user has, not just their primary role.

### 4. Handle Permissions Properly
Check guardian permissions (can_pickup, financial_responsibility) before allowing actions.

### 5. Maintain Data Integrity
- Always set exactly ONE primary guardian per student
- Use the national_id field to prevent duplicate registrations
- Store name/email only in profiles table (no duplication)

## Migration

To apply the Guardian schema:

```bash
# Run the migration in Supabase
# The migration file is: supabase/migrations/20251125_create_guardian_schema.sql
```

The migration will:
1. Create `guardians` table
2. Create `student_guardians` junction table
3. Set up RLS policies
4. Create 13 optimized indexes
5. Add triggers for timestamp updates
6. Create helper function `is_guardian()`
7. Add constraints for data integrity

## Security (RLS Policies)

- ✅ Authenticated users can view all guardians (teachers need to see guardian info)
- ✅ Admins can manage all guardian records
- ✅ Guardians can view and update their own information
- ✅ Guardians can view their own student relationships
- ❌ Guardians cannot change their national_id (requires admin)

## Common Queries

### Find all teachers who are also guardians
```typescript
const supabase = await createClient();

const { data } = await supabase
  .from('teachers')
  .select(`
    *,
    profiles:id (first_name, last_name, email),
    guardians:id (phone_number, occupation)
  `)
  .not('guardians', 'is', null);
```

### Get all students of a teacher-guardian
```typescript
const { data } = await supabase
  .from('student_guardians')
  .select(`
    *,
    students:student_id (
      id,
      profiles:id (first_name, last_name)
    )
  `)
  .eq('guardian_id', teacherGuardianId);
```

### Find guardians with financial responsibility
```typescript
const { data } = await supabase
  .from('student_guardians')
  .select(`
    *,
    guardians:guardian_id (
      id,
      profiles:id (first_name, last_name, email)
    )
  `)
  .eq('financial_responsibility', true);
```
