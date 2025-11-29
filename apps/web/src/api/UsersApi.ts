import instance from "@/axios/axiosInstance";

export const getUsers = async () => {
  try {
    const response = await instance.get("/users", {
      params: {
        limit: 100,
        offset: 0,
        include_deleted: false
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getUserById = async (id: string | undefined) => {
  try {
    const response = await instance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
};

export const getUsersTeams = async () => {
  try {
    const response = await instance.get("/teams");
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export const getSortOptions = async () => {
  try {
    const response = await instance.get("/sortOptions");
    return response.data;
  } catch (error) {
    console.error("Error fetching sort options:", error);
    return [];
  }
};

export const getImportantLinks = async () => {
  try {
    const response = await instance.get("/importantLinks");
    return response.data;
  } catch (error) {
    console.error("Error fetching important links:", error);
    return [];
  }
};

export const getTabNameForUserDetails = async () => {
  try {
    const response = await instance.get(`/tabs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tabs:", error);
    return [];
  }
};

export const getUserTabDetails = async (tabName: string | undefined) => {
  try {
    const response = await instance.get(`/${tabName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tab details for ${tabName}:`, error);
    return null;
  }
};
