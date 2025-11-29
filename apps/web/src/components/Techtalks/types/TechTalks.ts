export type Role = "admin" | "user";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type TechTalk = {
  id: number;
  name: string;
  owner: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  date?: string;
  description?: string;
};
