import instance from "../axios/axiosInstance";

export interface Comment {
  id: number;
  user_id: number;
  target_type: string;
  target_id: number;
  text: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user_name?: string;
  userName?: string;
  user_avatar?: string;
  userAvatar?: string;
}

export async function fetchComments(
  targetType: string,
  targetId: number,
): Promise<Comment[]> {
  const { data } = await instance.get<Comment[]>("/comments", {
    params: {
      target_type: targetType,
      target_id: targetId,
    },
  });
  return data;
}

export async function createComment(payload: {
  target_type: string;
  target_id: number;
  text: string;
  parent_id?: number;
}): Promise<Comment> {
  const { data } = await instance.post<Comment>("/comments", payload);
  return data;
}

export async function updateComment(
  id: number,
  text: string,
): Promise<Comment> {
  const { data } = await instance.patch<Comment>(`/comments/${id}`, { text });
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await instance.delete(`/comments/${id}`);
}
