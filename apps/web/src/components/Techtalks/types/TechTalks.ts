export type Role = "admin" | "user" | "supervisor";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type TechTalk = {
  id: number;
  user_id?: number;
  userId?: number;
  title: string;
  description?: string;
  location?: string;
  duration_min?: number;
  video_url?: string;
  thumbnail_url?: string;
  teams_room_url?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Legacy fields
  duration?: string;
  likes?: string | number;
  videoUrl?: string;
  thumbnailUrl?: string;
  owner?: string;
  presenter?: string;
  comments?: TechTalkComment[];
  likedUserIds?: number[];
};

export type TechTalkComment = {
  id: number;
  userId: number;
  userName: string;
  comment: string;
  date: string;
};
export type FetchTechTalkResponse = {
  data: TechTalk[];
};
