import {
  $isLoggedIn,
  $user,
  $userDepartment,
  $userName,
  $userRole,
  getUser,
  isLoggedIn,
} from "@/stores/userStore";

export { $isLoggedIn, $user, $userDepartment, $userName, $userRole };

export { getUser, isLoggedIn };

export const user = {
  store: $user,
  isLoggedIn: $isLoggedIn,
  name: $userName,
  role: $userRole,
  department: $userDepartment,

  get: getUser,
  check: isLoggedIn,
};

export const currentUser = getUser;
export const checkAuth = isLoggedIn;
