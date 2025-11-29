import instance from "@/axios/axiosInstance";

export async function getAllDocuments() {
    const response = await instance.get("/Documents");
    return response.data;
}

export async function getDocumentBySlug(slug: string) {
    const response = await instance.get(`/Documents/${slug}`);
    return response.data;
}