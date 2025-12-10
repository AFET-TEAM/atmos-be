export type Role = "admin" | "user";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type TechTalk = {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  location?: string;
  duration_min?: number;
  video_url?: string;
  thumbnail_url?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;

  // Frontend için backward compatibility
  name?: string;
  owner?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};
