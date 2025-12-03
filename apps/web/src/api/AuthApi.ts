import instance from "@/axios/axiosInstance";

export async function registerUser(
  email: string,
  password: string,
  full_name: string,
  department_id: string
) {
  const response = await instance.post("/auth/register", {
    email,
    password,
    full_name,
    department_id,
  });

  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await instance.post("/auth/login", { email, password });
  console.log(response.data, "AuthApi loginUser response:");
  return response.data;
}

export async function logoutUser() {
  const response = await instance.post("/auth/logout");
  return response.data;
}

export async function getDepartments() {
  const response = await instance.get("/departments");
  return response.data;
}
