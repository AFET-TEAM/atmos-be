import instance from "../axios/axiosInstance";
import type {
  CreateIdeaPayload,
  CurrentUser,
  Idea,
  RawIdeaFromApi,
  UpdateIdeaPayload,
} from "../components/Ideas/types/IdeasTypes";
export type { Idea } from "../components/Ideas/types/IdeasTypes";

const ensureArray = (arr?: string[]) => (Array.isArray(arr) ? arr : []);

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await instance.get<CurrentUser>("/currentUser");
  return data;
}

export async function fetchIdeas(): Promise<RawIdeaFromApi[]> {
  const { data } = await instance.get<RawIdeaFromApi[]>("/ideas");
  console.log(data);
  return data;
}

export async function createIdea(payload: CreateIdeaPayload): Promise<Idea> {
  const { data } = await instance.post<Idea>("/ideas", payload);
  return data;
}

export async function updateIdea(
  id: number,
  payload: UpdateIdeaPayload,
): Promise<Idea> {
  const { data } = await instance.patch<Idea>(`/ideas/${id}`, payload);
  return data;
}

export async function deleteIdea(id: number): Promise<void> {
  await instance.delete(`/ideas/${id}`);
}

export async function approveIdea(
  id: number,
  currentUser: string,
): Promise<Idea> {
  const idea = await getIdeaById(id);
  const approved = new Set(ensureArray(idea.approvedBy));
  approved.add(currentUser);
  const updated = { ...idea, approvedBy: Array.from(approved) };
  const { data } = await instance.patch<Idea>(`/ideas/${id}`, updated);
  return data;
}

export async function rejectIdea(id: number): Promise<void> {
  await deleteIdea(id);
}

export async function joinFrontend(id: number, userId: string): Promise<Idea> {
  const idea = await getIdeaById(id);
  const max = idea.frontendCount ?? 0;
  const list = ensureArray(idea.frontendParticipants);
  if (max > 0 && list.length >= max) return idea;
  if (!list.includes(userId)) list.push(userId);
  const { data } = await instance.patch<Idea>(`/ideas/${id}`, {
    ...idea,
    frontendParticipants: list,
  });
  return data;
}

export async function joinBackend(id: number, userId: string): Promise<Idea> {
  const idea = await getIdeaById(id);
  const max = idea.backendCount ?? 0;
  const list = ensureArray(idea.backendParticipants);
  if (max > 0 && list.length >= max) return idea;
  if (!list.includes(userId)) list.push(userId);
  const { data } = await instance.patch<Idea>(`/ideas/${id}`, {
    ...idea,
    backendParticipants: list,
  });
  return data;
}

export async function getIdeaById(id: number): Promise<Idea> {
  const { data } = await instance.get<Idea>(`/ideas/${id}`);
  return data;
}
