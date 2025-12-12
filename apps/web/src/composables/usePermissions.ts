import { $user } from "@/stores/userStore";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  isAdmin,
  isSupervisor,
  type PermissionKey,
  type UserRole,
} from "@/utils/rbac";

/**
 * Component'te kullanmak için reactive permission checker
 * @example
 * const { can } = usePermissions();
 * {#if can("DELETE_USER")}
 *   <DeleteButton />
 * {/if}
 */
export function usePermissions() {
  return {
    can: (permission: PermissionKey): boolean => {
      const user = $user.get();
      return hasPermission(user?.role as UserRole | undefined, permission);
    },

    canAny: (permissions: PermissionKey[]): boolean => {
      const user = $user.get();
      return hasAnyPermission(user?.role as UserRole | undefined, permissions);
    },

    canAll: (permissions: PermissionKey[]): boolean => {
      const user = $user.get();
      return hasAllPermissions(user?.role as UserRole | undefined, permissions);
    },

    hasRole: (roles: UserRole[]): boolean => {
      const user = $user.get();
      return hasRole(user?.role as UserRole | undefined, roles);
    },

    isAdmin: (): boolean => {
      const user = $user.get();
      return isAdmin(user?.role as UserRole | undefined);
    },

    isSupervisor: (): boolean => {
      const user = $user.get();
      return isSupervisor(user?.role as UserRole | undefined);
    },
  };
}

export { $user };
