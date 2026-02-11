import { apiCall } from "@/utils/errorHandler";
import instance from "../axios/axiosInstance";

export interface Like {
  id: number;
  user_id: number;
  target_type: string;
  target_id: number;
  created_at: string;
}

export async function fetchLikes(
  targetType: string,
  targetId: number,
): Promise<Like[]> {
  return apiCall(async () => {
    const { data } = await instance.get<Like[]>("/likes", {
      params: {
        target_type: targetType,
        target_id: targetId,
      },
    });
    return data;
  }, "fetchLikes");
}

export async function toggleLike(payload: {
  target_type: string;
  target_id: number;
}): Promise<{ action: "liked" | "unliked"; id?: number }> {
  return apiCall(async () => {
    const { data } = await instance.post<{
      action: "liked" | "unliked";
      id?: number;
    }>("/likes/toggle", payload);
    return data;
  }, "toggleLike");
}

export async function deleteLike(id: number): Promise<void> {
  return apiCall(async () => {
    await instance.delete(`/likes/${id}`);
  }, "deleteLike");
}
