export type Role = "admin" | "user";

export interface Idea {
  id: number;
  title: string;
  owner: string;
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
