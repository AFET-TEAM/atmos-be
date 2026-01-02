import instance from "@/axios/axiosInstance.ts";

export const getAnnouncements = async () => {
  const response = await instance.get("/announcements");
  return response.data;
};

export const createAnnouncement = async (announcement: {
  title: string;
  content: string;
}) => {
  const response = await instance.post("/announcements", announcement);
  return response.data;
};

export const updateAnnouncement = async (
  id: number,
  announcement: {
    title: string;
    content: string;
  }
) => {
  const response = await instance.put(`/announcements/${id}`, announcement);
  return response.data;
};

export const deleteAnnouncement = async (id: number) => {
  const response = await instance.delete(`/announcements/${id}`);
  return response.data;
};
