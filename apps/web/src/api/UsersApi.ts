import instance from "@/axios/axiosInstance";
import { apiCall } from "@/utils/errorHandler";

export const getUsers = async () => {
  return apiCall(async () => {
    const response = await instance.get("/users", {
      params: {
        limit: 100,
        offset: 0,
        include_deleted: false,
      },
    });
    return response.data;
  }, "getUsers");
};

export const getUserById = async (id: number | string | undefined) => {
  return apiCall(async () => {
    const response = await instance.get(`/users/${id}`);
    return response.data;
  }, "getUserById");
};

export const getUsersTeams = async () => {
  return apiCall(async () => {
    const response = await instance.get("/teams");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getUsersTeams");
};

export const getUsersDepartments = async () => {
  return apiCall(async () => {
    const response = await instance.get("/departments");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getUsersDepartments");
};

export const getUsersDirectorates = async () => {
  return apiCall(async () => {
    const response = await instance.get("/directorates");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getUsersDirectorates");
};

export const getUserByProfession = async () => {
  return apiCall(async () => {
    const response = await instance.get("/lookups/professions");
    return response.data;
  }, "getUserByProfession");
};

export const getSortOptions = async () => {
  return apiCall(async () => {
    const response = await instance.get("/sortOptions");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getSortOptions");
};

export const getImportantLinks = async () => {
  return apiCall(async () => {
    const response = await instance.get("/importantLinks");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getImportantLinks");
};

export const getTabNameForUserDetails = async () => {
  return apiCall(async () => {
    const response = await instance.get("/tab_headers");
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }, "getTabNameForUserDetails");
};

export const getUserTabDetails = async (
  tabName: string | undefined,
  userId: string | undefined,
) => {
  return apiCall(async () => {
    const response = await instance.get(`/${tabName}/${userId}`);
    return response.data;
  }, "getUserTabDetails");
};

export const getUserTeamMembers = async (userId: string | undefined) => {
  return apiCall(async () => {
    const response = await instance.get(`/teams/${userId}/colleagues`);
    return response.data;
  }, "getUserTeamMembers");
};

export const getUserMeetings = async (userId: number | string | undefined) => {
  return apiCall(async () => {
    const response = await instance.get(`/users/${userId}/meetings`);
    return response.data;
  }, "getUserMeetings");
};

export const createMeeting = async (meetingData: {
  title: string;
  starts_at: string;
  ends_at: string;
  created_by?: number;
}) => {
  return apiCall(async () => {
    const response = await instance.post(`/meetings`, meetingData);
    return response.data;
  }, "createMeeting");
};

export const filterUsersByFields = async (field: any) => {
  return apiCall(async () => {
    const response = await instance.post("/filter/users-by-fields", field);
    return response.data;
  }, "filterUsersByFields");
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
  },
) => {
  return apiCall(async () => {
    const response = await instance.patch(`/users/${id}`, userData);
    return response.data;
  }, "updateUser");
};

export const deleteUser = async (id: number) => {
  return apiCall(async () => {
    const response = await instance.delete(`/users/${id}`);
    return response.data;
  }, "deleteUser");
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
  return apiCall(async () => {
    const response = await instance.post("/users", userData);
    return response.data;
  }, "createUser");
};
