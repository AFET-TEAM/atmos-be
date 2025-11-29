import instance from "../axios/axiosInstance";
import type { TechTalk } from "@/components/Techtalks/types/TechTalks";

export async function fetchTechTalks(): Promise<TechTalk[]> {
  const { data } = await instance.get<TechTalk[]>("/techtalks");
  return data;
}

export async function fetchTechTalk(id: number): Promise<TechTalk> {
  const { data } = await instance.get<TechTalk>(`/techtalks/${id}`);
  return data;
}

export async function deleteTechTalk(id: number): Promise<void> {
  await instance.delete(`/techtalks/${id}`);
}

export async function updateTechTalk(
  id: number,
  payload: Partial<TechTalk>
): Promise<TechTalk> {
  const { data } = await instance.put<TechTalk>(`/techtalks/${id}`, payload);
  return data;
}

export async function createTechTalk(
  payload: Omit<TechTalk, "id">
): Promise<TechTalk> {
  const { data } = await instance.post<TechTalk>("/techtalks", payload);
  return data;
}

export async function putTechTalk(
  id: number,
  payload: Partial<TechTalk>
): Promise<TechTalk> {
  const { data } = await instance.put<TechTalk>(`/techtalks/${id}`, payload);
  return data;
}
