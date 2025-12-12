export type Role = "admin" | "supervisor" | "user";

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
  full_name: string;
  team?: string;
  profession?: string;
  profile_picture?: string;
  address?: string;
  connection?: boolean;
  user_department?: string;
  user_status_id?: number;
};
