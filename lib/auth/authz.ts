import { Permission, getPermissionsForRole } from "./permissions";
import { User } from "@/types";

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  const permissions = getPermissionsForRole(user.role);
  return permissions.has(permission);
}

// Server-side guard helper: throw or return boolean as needed by the caller
export function requirePermission(user: User | null | undefined, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    const err = new Error("Forbidden");
    // Attach a hint for upstream error handlers if needed
    // @ts-ignore
    err.statusCode = 403;
    throw err;
  }
}


