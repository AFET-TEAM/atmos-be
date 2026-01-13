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
  targetId: number
): Promise<Like[]> {
  const { data } = await instance.get<Like[]>("/likes", {
    params: {
      target_type: targetType,
      target_id: targetId,
    },
  });
  return data;
}

export async function toggleLike(payload: {
  user_id: number;
  target_type: string;
  target_id: number;
}): Promise<{ action: "liked" | "unliked"; id?: number }> {
  const { data } = await instance.post<{
    action: "liked" | "unliked";
    id?: number;
  }>("/likes/toggle", payload);
  return data;
}

export async function deleteLike(id: number): Promise<void> {
  await instance.delete(`/likes/${id}`);
}
