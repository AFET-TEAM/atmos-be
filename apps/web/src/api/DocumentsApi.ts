import instance from "@/axios/axiosInstance";

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
  const response = await instance.get<DocumentItem[]>("/documents");
  return response.data;
}

export async function getDocumentById(id: number): Promise<DocumentItem> {
  const response = await instance.get<DocumentItem>(`/documents/${id}`);
  return response.data;
}

export async function getDocumentBySlug(slug: string): Promise<DocumentItem> {
  const response = await instance.get<DocumentItem>(`/documents/${slug}`);
  return response.data;
}

export async function createDocument(
  payload: CreateDocumentPayload,
): Promise<DocumentItem> {
  const response = await instance.post<DocumentItem>("/documents", payload);
  return response.data;
}

export async function updateDocument(
  id: number,
  payload: Partial<CreateDocumentPayload>,
): Promise<DocumentItem> {
  const response = await instance.patch<DocumentItem>(
    `/documents/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteDocument(id: number): Promise<void> {
  await instance.delete(`/documents/${id}`);
}

export async function downloadDocument(id: number): Promise<Blob> {
  const response = await instance.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}
