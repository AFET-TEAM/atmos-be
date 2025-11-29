import instance from "@/axios/axiosInstance";

export async function getAllDocuments() {
    const response = await instance.get("/documents");
    return response.data;
}

export async function getDocumentBySlug(slug: string) {
    const response = await instance.get(`/documents/${slug}`);
    return response.data;
}
