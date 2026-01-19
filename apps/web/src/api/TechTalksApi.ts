import type {
  FetchTechTalkResponse,
  TechTalk,
  TechTalkComment,
} from "@/components/Techtalks/types/TechTalks";
import instance from "../axios/axiosInstance";
import { fetchCurrentUser } from "./IdeasApi";

export async function fetchTechTalks(): Promise<TechTalk[]> {
  const { data } = await instance.get<TechTalk[]>("/techtalks");

  console.log("Fetched TechTalks:", data);
  return data;
}

export async function fetchTechTalk(id: number): Promise<TechTalk> {
  const { data } = await instance.get<FetchTechTalkResponse>(
    `/techtalks/${id}`,
  );

  if (Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0];
  }

  const all = await fetchTechTalks();
  const found = all.find((t) => t.id === id);

  if (!found) {
    throw new Error("TechTalk bulunamadı");
  }

  return found;
}

export async function deleteTechTalk(id: number): Promise<void> {
  await instance.delete(`/techtalks/${id}`);
}

export async function updateTechTalk(
  id: number,
  payload: Partial<TechTalk>,
): Promise<TechTalk> {
  const { data } = await instance.patch<TechTalk>(`/techtalks/${id}`, payload);
  return data;
}

export async function createTechTalk(
  payload: Omit<TechTalk, "id">,
): Promise<TechTalk> {
  const { data } = await instance.post<TechTalk>("/techtalks", payload);
  return data;
}

export async function putTechTalk(
  id: number,
  payload: Partial<TechTalk>,
): Promise<TechTalk> {
  const { data } = await instance.put<TechTalk>(`/techtalks/${id}`, payload);
  return data;
}

export async function fetchLastTechTalk(): Promise<TechTalk[]> {
  const { data } = await instance.get<{ data: TechTalk[] }>("/lastTechTalks");

  console.log("Fetched last TechTalks:", data);
  return data.data;
}

export async function addTechTalkComment(
  techtalkId: string,
  payload: Omit<TechTalkComment, "id">,
): Promise<TechTalk> {
  const { data: talk } = await instance.get<TechTalk>(
    `/techtalks/${techtalkId}`,
  );

  const comments = talk.comments ?? [];
  const nextId =
    comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;

  const newComment: TechTalkComment = { id: nextId, ...payload };

  const updatedTalk: TechTalk = {
    ...talk,
    comments: [...comments, newComment],
  };

  const { data: updated } = await instance.put<TechTalk>(
    `/techtalks/${techtalkId}`,
    updatedTalk,
  );

  return updated;
}

export async function addCommentWithMe(
  techtalkId: string,
  comment: string,
): Promise<TechTalk> {
  const user = await fetchCurrentUser();

  return addTechTalkComment(techtalkId, {
    userId: Number(user.id) || 0,
    userName: user.name,
    comment: comment.trim(),
    date: new Date().toISOString().slice(0, 10),
  });
}

export async function updateTechTalkComment(
  techtalkId: string,
  commentId: number,
  payload: Partial<Pick<TechTalkComment, "comment" | "date">>,
): Promise<TechTalk> {
  const { data: talk } = await instance.get<TechTalk>(
    `/techtalks/${techtalkId}`,
  );

  const comments = talk.comments ?? [];
  const updatedComments = comments.map((c) =>
    c.id === commentId ? { ...c, ...payload } : c,
  );

  const { data: updated } = await instance.put<TechTalk>(
    `/techtalks/${techtalkId}`,
    { ...talk, comments: updatedComments },
  );

  return updated;
}

export async function deleteTechTalkComment(
  techtalkId: string,
  commentId: number,
): Promise<TechTalk> {
  const { data: talk } = await instance.get<TechTalk>(
    `/techtalks/${techtalkId}`,
  );

  const comments = talk.comments ?? [];
  const filteredComments = comments.filter((c) => c.id !== commentId);

  const { data: updated } = await instance.put<TechTalk>(
    `/techtalks/${techtalkId}`,
    { ...talk, comments: filteredComments },
  );

  return updated;
}

export async function addTechTalkLike(techtalkId: string): Promise<TechTalk> {
  const user = await fetchCurrentUser();
  const userId = Number(user.id) || 0;

  const { data: talk } = await instance.get<TechTalk>(
    `/techtalks/${techtalkId}`,
  );

  const likedUserIds: number[] = talk.likedUserIds ?? [];
  let likes = Number(talk.likes ?? 0);

  let updatedLikedUserIds: number[];

  if (likedUserIds.includes(userId)) {
    likes = Math.max(0, likes - 1);
    updatedLikedUserIds = likedUserIds.filter((id) => id !== userId);
  } else {
    likes = likes + 1;
    updatedLikedUserIds = [...likedUserIds, userId];
  }

  const updatedTalk: TechTalk = {
    ...talk,
    likes: String(likes),
    likedUserIds: updatedLikedUserIds,
  };

  const { data: updated } = await instance.put<TechTalk>(
    `/techtalks/${techtalkId}`,
    updatedTalk,
  );

  return updated;
}
