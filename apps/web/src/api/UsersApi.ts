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
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export const getUsersDepartments = async () => {
  try {
    const response = await instance.get("/departments");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

export const getUsersDirectorates = async () => {
  try {
    const response = await instance.get("/directorates");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching directorates:", error);
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
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching sort options:", error);
    return [];
  }
};

export const getImportantLinks = async () => {
  try {
    const response = await instance.get("/importantLinks");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  } catch (error) {
    console.error("Error fetching important links:", error);
    return [];
  }
};

export const getTabNameForUserDetails = async () => {
  try {
    const response = await instance.get("/tab_headers");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
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

export const filterUsersByFields = async (field: any) => {
  try {
    const response = await instance.post("/filter/users-by-fields", field);
    return response.data;
  } catch (error) {
    console.error("Error filtering users:", error);
    return [];
  }
};
export const updateUser = async (
  id: number,
  userData: {
    email?: string;
    full_name?: string;
    team?: string;
    profession?: string;
    profile_picture?: string;
    address?: string;
    user_department?: number;
    department_label?: string;
    directorate?: number;
    directorate_label?: string;
    team_label?: string;
    connection?: boolean;
    user_status_id?: number;
    role?: string;
  }
) => {
  try {
    const response = await instance.patch(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    return null;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const response = await instance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return null;
  }
};

export const createUser = async (userData: {
  email: string;
  full_name: string;
  team?: string;
  profession?: string;
  profile_picture?: string;
  address?: string;
  user_department?: number;
  department_label?: string;
  directorate?: number;
  directorate_label?: string;
  team_label?: string;
  role?: string;
}) => {
  try {
    const response = await instance.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};
