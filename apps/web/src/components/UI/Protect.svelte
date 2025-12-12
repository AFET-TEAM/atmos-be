<script lang="ts">
  import { getUser } from "@/stores/userStore";
  import {
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    hasRole,
    type PermissionKey,
    type UserRole,
  } from "@/utils/rbac";

  /**
   *
   *
   *
   *
   * @param permission
   * @param permissions
   * @param requireAll
   * @param roles
   * @param fallback
   */
  export let permission: PermissionKey | undefined = undefined;
  export let permissions: PermissionKey[] | undefined = undefined;
  export let requireAll: boolean = false;
  export let roles: UserRole[] | undefined = undefined;
  export let fallback: boolean = false;
  const user = getUser();

  $: hasAccess = (() => {
    const userRole = user?.role as UserRole | undefined;

    if (permission) {
      return hasPermission(userRole, permission);
    }

    if (permissions && permissions.length > 0) {
      return requireAll
        ? hasAllPermissions(userRole, permissions)
        : hasAnyPermission(userRole, permissions);
    }

    if (roles && roles.length > 0) {
      return hasRole(userRole, roles);
    }

    return true;
  })();
</script>

{#if hasAccess}
  <slot />
{:else if fallback}
  <slot name="denied">
    <div class="access-denied">
      <p>Bu bölüme erişim yetkiniz yok.</p>
    </div>
  </slot>
{/if}

<style>
  .access-denied {
    padding: 1rem;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    color: #c00;
    text-align: center;
    font-size: 0.9rem;
  }
</style>
