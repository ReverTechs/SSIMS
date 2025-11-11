"use client";

import { ReactNode, useMemo } from "react";
import { Permission, getPermissionsForRole } from "@/lib/auth/permissions";
import { User } from "@/types";

interface RequirePermissionProps {
  user: User | null | undefined;
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({
  user,
  permission,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const isAllowed = useMemo(() => {
    if (!user) return false;
    return getPermissionsForRole(user.role).has(permission);
  }, [user, permission]);

  return <>{isAllowed ? children : fallback}</>;
}


