import instance from "@/axios/axiosInstance";

export const getUsers = async () => {
  try {
    const response = await instance.get("/users", {
      params: {
        limit: 100,
        offset: 0,
        include_deleted: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const getUserById = async (id: number | string | undefined) => {
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

export const getUserByProfession = async () => {
  try {
    const response = await instance.get("/lookups/professions");
    return response.data;
  } catch (error) {
    console.error("Error fetching professions:", error);
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
    const response = await instance.get("/tab_headers");
    return response.data;
  } catch (error) {
    console.error("Error fetching tab names for user details:", error);
    return [];
  }
};

export const getUserTabDetails = async (
  tabName: string | undefined,
  userId: string | undefined
) => {
  console.log("Fetching tab details for:", tabName, "and userId:", userId);
  try {
    const response = await instance.get(`/${tabName}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tab details for ${tabName}:`, error);
    return null;
  }
};

export const getUserTeamMembers = async (userId: string | undefined) => {
  try {
    const response = await instance.get(`/teams/${userId}/colleagues`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team members for team ${userId}:`, error);
    return [];
  }
};

export const getUserMeetings = async (userId: number | string | undefined) => {
  try {
    const response = await instance.get(`/users/${userId}/meetings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId} meetings:`, error);
    return [];
  }
};

export const createMeeting = async (meetingData: {
  title: string;
  starts_at: string;
  ends_at: string;
  created_by?: number;
}) => {
  try {
    const response = await instance.post(`/meetings`, meetingData);
    return response.data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return null;
  }
};
