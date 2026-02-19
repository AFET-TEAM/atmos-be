import { apiCall } from "@/utils/errorHandler";
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
  return apiCall(async () => {
    const { data } = await instance.get<CurrentUser>("/currentUser");
    return data;
  }, "fetchCurrentUser");
}

export async function fetchIdeas(): Promise<RawIdeaFromApi[]> {
  return apiCall(async () => {
    const { data } = await instance.get<RawIdeaFromApi[]>("/ideas");
    return data;
  }, "fetchIdeas");
}

export async function createIdea(payload: CreateIdeaPayload): Promise<Idea> {
  return apiCall(async () => {
    const { data } = await instance.post<Idea>("/ideas", payload);
    return data;
  }, "createIdea");
}

export async function updateIdea(
  id: number,
  payload: UpdateIdeaPayload,
): Promise<Idea> {
  return apiCall(async () => {
    const { data } = await instance.patch<Idea>(`/ideas/${id}`, payload);
    return data;
  }, "updateIdea");
}

export async function deleteIdea(id: number): Promise<void> {
  return apiCall(async () => {
    await instance.delete(`/ideas/${id}`);
  }, "deleteIdea");
}

export async function approveIdea(
  id: number,
  currentUser: string,
): Promise<Idea> {
  const { data } = await instance.patch<Idea>(`/ideas/${id}`, {
    status: "approved",

    approvedBy: [...((await getIdeaById(id)).approvedBy ?? []), currentUser],
  });
  return data;
}

export async function rejectIdea(id: number): Promise<void> {
  await apiCall(async () => {
    await instance.patch(`/ideas/${id}`, { status: "rejected" });
  }, "rejectIdea");
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
