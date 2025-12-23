import instance from "@/axios/axiosInstance";
import { login, logout as logoutStore } from "@/stores/userStore";

export async function registerUser(
  email: string,
  password: string,
  full_name: string,
  user_department: string,
  address: string
) {
  const response = await instance.post("/auth/register", {
    email,
    password,
    full_name,
    user_department,
    address,
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
  const response = await instance.get("/departments");
  return response.data;
}

export async function getTeams() {
  const response = await instance.get("/teams");
  return response.data;
}

export async function getCities() {
  const response = await instance.get("/cities");
  return response.data;
}

export async function getUserInfoCount(userId: number | undefined) {
  const response = await instance.get(`/users/${userId}/counts`);
  return response.data;
}
