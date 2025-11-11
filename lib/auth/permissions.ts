import { UserRole } from "@/types";

// Client-side guard,
// A small component to conditionally render children based on a permission, with optional fallback.

// Define capability strings. Use string unions for type-safety and future extensibility.
export type Permission =
  | "announcements:create"
  | "council:edit"
  | "grades:manage"
  | "grades:view_children"
  | "stats:admin:view"
  | "stats:head:view"
  | "stats:deputy:view"
  | "stats:teacher:view"
  | "stats:student:view"
  | "stats:guardian:view";

// Map roles to permissions. Central place to evolve policy.
const roleToPermissionsMap: Record<UserRole, ReadonlyArray<Permission>> = {
  admin: ["announcements:create", "council:edit", "stats:admin:view"],
  headteacher: ["announcements:create", "council:edit", "stats:head:view"],
  deputy_headteacher: [
    "announcements:create",
    "council:edit",
    "stats:deputy:view",
  ],
  teacher: ["announcements:create", "grades:manage", "stats:teacher:view"],
  student: ["stats:student:view"],
  guardian: ["grades:view_children", "stats:guardian:view"],
};

export function getPermissionsForRole(role: UserRole): Set<Permission> {
  return new Set(roleToPermissionsMap[role] ?? []);
}
