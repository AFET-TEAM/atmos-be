import instance from "@/axios/axiosInstance";

export const getUsers = async () => {
  return await instance.get("/users");
};

export const getUserById = async (id: string | undefined) => {
  return await instance.get(`/users/${id}`);
};

export const getUsersTeams = async () => {
  return await instance.get("/teams");
};

export const getSortOptions = async () => {
  return await instance.get("/sortOptions");
};

export const getImportantLinks = async () => {
  return await instance.get("/importantLinks"); //burası userdan ayrılacak dashboard servisi içine koyulacak. servis gelene kadar böyle
};

export const getTabNameForUserDetails = async () => {
  const response = await instance.get(`/tabs`);
  console.log("Response from getTabNameForUserDetails:", response);
  return response.data;
};

export const getUserTabDetails = async (tabName: string | undefined) => {
  const response = await instance.get(`/${tabName}`);
  return response.data;
};
