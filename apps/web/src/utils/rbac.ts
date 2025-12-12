export type UserRole = "admin" | "supervisor" | "user" | string;

export interface Permission {
  name: string;
  roles: UserRole[];
  description?: string;
}

export interface FeatureAccess {
  [feature: string]: UserRole[];
}

export interface PermissionDefinition {
  roles: UserRole[];
  description?: string;
}

export const PERMISSIONS: Record<string, PermissionDefinition> = {
  VIEW_USERS: {
    roles: ["admin"],
    description: "Kullanıcıları görebilir",
  },
  CREATE_USER: {
    roles: ["admin"],
    description: "Yeni kullanıcı oluşturabilir",
  },
  EDIT_USER: {
    roles: ["admin"],
    description: "Kullanıcı düzenleyebilir",
  },
  DELETE_USER: { roles: ["admin"], description: "Kullanıcı silebilir" },

  CREATE_TECHTALK: {
    roles: ["admin", "supervisor", "user"],
    description: "TechTalk oluşturabilir",
  },
  EDIT_TECHTALK: {
    roles: ["admin", "supervisor"],
    description: "TechTalk düzenleyebilir",
  },
  DELETE_TECHTALK: {
    roles: ["admin", "supervisor"],
    description: "TechTalk silebilir",
  },

  CREATE_DOCUMENT: {
    roles: ["admin", "supervisor", "user"],
    description: "Dokument oluşturabilir",
  },
  EDIT_DOCUMENT: {
    roles: ["admin", "supervisor"],
    description: "Dokument düzenleyebilir",
  },
  DELETE_DOCUMENT: {
    roles: ["admin", "supervisor"],
    description: "Dokument silebilir",
  },

  CREATE_IDEA: {
    roles: ["admin", "supervisor", "user"],
    description: "İdea oluşturabilir",
  },
  EDIT_IDEA: {
    roles: ["admin", "supervisor"],
    description: "İdea düzenleyebilir",
  },
  DELETE_IDEA: { roles: ["admin"], description: "İdea silebilir" },

  CREATE_MEETING: {
    roles: ["admin", "supervisor"],
    description: "Toplantı oluşturabilir",
  },
  EDIT_MEETING: {
    roles: ["admin", "supervisor"],
    description: "Toplantı düzenleyebilir",
  },
  DELETE_MEETING: {
    roles: ["admin", "supervisor"],
    description: "Toplantı silebilir",
  },

  VIEW_ANALYTICS: {
    roles: ["admin"],
    description: "Analitics görebilir",
  },
  MANAGE_ROLES: { roles: ["admin"], description: "Rol yönetebilir" },
  SYSTEM_SETTINGS: {
    roles: ["admin"],
    description: "Sistem ayarlarını düzenleyebilir",
  },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Verilen rolün belirtilen permissiona sahip olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param permission - Kontrol edilecek permission
 * @returns true eğer kullanıcı permission'a sahipse
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: PermissionKey
): boolean {
  if (!userRole) return false;
  const perm = PERMISSIONS[permission];
  return perm.roles.includes(userRole as UserRole);
}

/**
 * Kullanıcının verilen permission'lardan herhangi birine sahip olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param permissions - Kontrol edilecek permission'lar
 * @returns true eğer kullanıcı herhangi bir permission'a sahipse
 */
export function hasAnyPermission(
  userRole: UserRole | null | undefined,
  permissions: PermissionKey[]
): boolean {
  return permissions.some((perm) => hasPermission(userRole, perm));
}

/**
 * Kullanıcının tüm verilen permission'lara sahip olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param permissions - Kontrol edilecek permission'lar
 * @returns true eğer kullanıcı tüm permission'lara sahipse
 */
export function hasAllPermissions(
  userRole: UserRole | null | undefined,
  permissions: PermissionKey[]
): boolean {
  return permissions.every((perm) => hasPermission(userRole, perm));
}

/**
 * Kullanıcının verilen rol listesinde olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param roles - Kontrol edilecek rol listesi
 * @returns true eğer kullanıcı rol listesinde varsa
 */
export function hasRole(
  userRole: UserRole | null | undefined,
  roles: UserRole[]
): boolean {
  if (!userRole) return false;
  return roles.includes(userRole);
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === "admin";
}

/**
 * Kullanıcının supervisor veya admin olup olmadığını kontrol eder
 */
export function isSupervisor(userRole: UserRole | null | undefined): boolean {
  return userRole === "supervisor" || userRole === "admin";
}

/**
 * Role'a göre görüntülenecek UI öğelerini belirler
 */
export const roleBasedUI = {
  // Admin exclusive buttons
  adminOnly: (role: UserRole | null | undefined) => isAdmin(role),

  // Supervisor ve Admin
  managerOnly: (role: UserRole | null | undefined) => isSupervisor(role),

  // Herkes görebilir
  everyoneCanView: () => true,

  // Sadece logged in users
  authRequired: (role: UserRole | null | undefined) =>
    role !== null && role !== undefined,
};

/**
 * Permission key'lerinin description'ını döndürür
 */
export function getPermissionDescription(permission: PermissionKey): string {
  return PERMISSIONS[permission].description || permission;
}

/**
 * Bir rolün tüm permission'larını döndürür
 */
export function getRolePermissions(role: UserRole): PermissionKey[] {
  return (Object.keys(PERMISSIONS) as PermissionKey[]).filter((perm) =>
    PERMISSIONS[perm].roles.includes(role)
  );
}
