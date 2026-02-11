import instance from "@/axios/axiosInstance";
import { apiCall } from "@/utils/errorHandler";

export interface DocumentItem {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  file_url: string | null;
  filename?: string | null;
  date: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  file_url?: string;
  file_data?: string;
  file_name?: string;
  date?: string;
}

export async function getAllDocuments(): Promise<any[]> {
  return apiCall(async () => {
    const response = await instance.get<DocumentItem[]>("/documents");
    return response.data;
  }, "getAllDocuments");
}

export async function getDocumentById(id: number): Promise<DocumentItem> {
  return apiCall(async () => {
    const response = await instance.get<DocumentItem>(`/documents/${id}`);
    return response.data;
  }, "getDocumentById");
}

export async function getDocumentBySlug(slug: string): Promise<DocumentItem> {
  const response = await instance.get<DocumentItem>(`/documents/${slug}`);
  return response.data;
}

export async function createDocument(
  payload: CreateDocumentPayload,
): Promise<DocumentItem> {
  return apiCall(async () => {
    const response = await instance.post<DocumentItem>("/documents", payload);
    return response.data;
  }, "createDocument");
}

export async function updateDocument(
  id: number,
  payload: Partial<CreateDocumentPayload>,
): Promise<DocumentItem> {
  return apiCall(async () => {
    const response = await instance.patch<DocumentItem>(
      `/documents/${id}`,
      payload,
    );
    return response.data;
  }, "updateDocument");
}

export async function deleteDocument(id: number): Promise<void> {
  return apiCall(async () => {
    await instance.delete(`/documents/${id}`);
  }, "deleteDocument");
}

export async function downloadDocument(id: number): Promise<Blob> {
  const response = await instance.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}
