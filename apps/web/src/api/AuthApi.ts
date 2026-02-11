import instance from "@/axios/axiosInstance";
import { login, logout as logoutStore } from "@/stores/userStore";
import { apiCall } from "@/utils/errorHandler";

export async function registerUser(
  email: string,
  password: string,
  full_name: string,
  user_department: number,
  address: string,
  team: string | undefined,
  directorate: number,
  gender: string | undefined,
  job: number | undefined,
) {
  const response = await instance.post("/auth/register", {
    email,
    password,
    full_name,
    user_department,
    address,
    team,
    directorate,
    gender,
    job,
  });

  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await instance.post("/auth/login", { email, password });

  if (response.data.user && response.data.token) {
    login(response.data.user, response.data.token);
  }

  return response.data;
}
export async function logoutUser() {
  try {
    await instance.post("/auth/logout");
  } finally {
    logoutStore();
  }
}

export async function getDepartments() {
  return apiCall(async () => {
    const response = await instance.get("/departments");
    return response.data;
  }, "getDepartments");
}

export async function getTeams() {
  return apiCall(async () => {
    const response = await instance.get("/teams");
    return response.data;
  }, "getTeams");
}

export async function getCities() {
  return apiCall(async () => {
    const response = await instance.get("/cities");
    return response.data;
  }, "getCities");
}

export async function getUserInfoCount(userId: number | undefined) {
  const response = await instance.get(`/users/${userId}/counts`);
  return response.data;
}

export async function getDirectorates() {
  return apiCall(async () => {
    const response = await instance.get("/directorates");
    return Array.isArray(response.data) ? response.data : [];
  }, "getDirectorates");
}

export async function getJobs() {
  return apiCall(async () => {
    const response = await instance.get("/jobs");
    return Array.isArray(response.data) ? response.data : [];
  }, "getJobs");
}
