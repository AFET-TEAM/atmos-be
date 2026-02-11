import instance from "@/axios/axiosInstance.ts";
import { apiCall } from "@/utils/errorHandler";

export const getAnnouncements = async () => {
  return apiCall(async () => {
    const response = await instance.get("/announcements");
    return response.data;
  }, "getAnnouncements");
};

export const createAnnouncement = async (announcement: {
  title: string;
  content: string;
}) => {
  return apiCall(async () => {
    const response = await instance.post("/announcements", announcement);
    return response.data;
  }, "createAnnouncement");
};

export const updateAnnouncement = async (
  id: number,
  announcement: {
    title: string;
    content: string;
  },
) => {
  return apiCall(async () => {
    const response = await instance.put(`/announcements/${id}`, announcement);
    return response.data;
  }, "updateAnnouncement");
};

export const deleteAnnouncement = async (id: number) => {
  return apiCall(async () => {
    const response = await instance.delete(`/announcements/${id}`);
    return response.data;
  }, "deleteAnnouncement");
};
