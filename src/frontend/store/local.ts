import { User } from "@modwatch/types";

export const getUserState = (): User | {} => {
  const user = localStorage.getItem("modwatch.user");
  if (!user) {
    return {};
  }
  try {
    return JSON.parse(user);
  } catch (e) {
    console.log(`Failed to parse saved user: "${user}"`, e);
    return clearUserState();
  }
};

export const setUserState = (user): User | {} => (
  localStorage.setItem("modwatch.user", JSON.stringify(user)), user
);

export const clearUserState = (): {} => (
  localStorage.setItem("modwatch.user", "{}"), {}
);