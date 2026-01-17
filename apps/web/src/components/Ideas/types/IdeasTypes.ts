export type Role = "admin" | "user";

export interface Idea {
  id: number;
  title: string;
  owner: string;
  ownerId?: string;
  date: string;
  description: string;
  presentationFileName?: string;
  frontendCount?: number;
  backendCount?: number;
  approvedBy: string[];
  frontendParticipants?: string[];
  backendParticipants?: string[];
}

export type CreateIdeaPayload = Omit<Idea, "id" | "approvedBy"> & {
  approvedBy?: string[];
};

export type UpdateIdeaPayload = Partial<Idea>;

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type RawIdeaFromApi = {
  id: number;
  userId: number;
  title: string;
  description: string;
  fileUrl: string;
  frontendCount: number;
  backendCount: number;
  ideaAssigneeId: number;
  date: string;
  approvedBy?: string[];
  frontendParticipants?: string[];
  backendParticipants?: string[];
};
