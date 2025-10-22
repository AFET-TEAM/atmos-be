export type Role = "admin" | "editor" | "user";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
};
