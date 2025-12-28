export type Role = "admin" | "user";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type TechTalk = {
  id: number;
  title: string;
  description?: string;
  date?: string;
  duration?: string;
  location?: string;
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
