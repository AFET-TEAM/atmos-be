export type ContentType =
  | "techtalk"
  | "document"
  | "report"
  | "idea"
  | "meeting";

export interface User {
  id: number;
  email: string;
  fullName: string;
  team?: string | null;
  profession?: string | null;
  profilePicture?: string | null;
  address?: string | null;
  connection?: boolean | null;
  userStatusId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  userId: number | null;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  date?: string | null;
  createdAt: string;
}

export interface Techtalk {
  id: number;
  userId: number | null;
  title: string;
  description?: string | null;
  location?: string | null;
  durationMin?: number | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  date?: string | null;
  createdAt: string;
}

export interface Report {
  id: number;
  userId: number | null;
  title: string;
  fileUrl?: string | null;
  date?: string | null;
  createdAt: string;
}

export interface Idea {
  id: number;
  userId: number | null;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  frontendCount?: number | null;
  backendCount?: number | null;
  ideaAssigneeId?: number | null;
  date?: string | null;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  createdBy?: number | null;
  assignedTo?: number | null;
  dueDate?: string | null;
  taskStatusId?: number | null;
  relatedType?: ContentType | null;
  relatedId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
}
export interface TeamMembership {
  id: number;
  teamId: number;
  userId: number;
  role?: string | null;
  joinedAt?: string | null;
  leftAt?: string | null;
}

export interface Meeting {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  createdBy?: number | null;
}

export interface Comment {
  id: number;
  userId: number;
  targetType: ContentType;
  targetId: number;
  text: string;
  parentId?: number | null;
  createdAt: string;
}

export interface Like {
  id: number;
  userId: number;
  targetType: ContentType;
  targetId: number;
  createdAt: string;
}

export interface UserStatus {
  id: number;
  code: string;
  name: string;
}
export interface TaskStatus {
  id: number;
  code: string;
  name: string;
}
export interface IdeaAssignee {
  id: number;
  code: string;
  name: string;
}
