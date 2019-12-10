import { User } from "@modwatch/types";

export const getUsers = (): User[] => {
  const users = localStorage.getItem("modwatch.users");
  if(!users) {
    return [];
  }
  try {
    return JSON.parse(users);
  } catch (e) {
    console.log(`Failed to parse saved users: "${users}"`, e);
    return clearUsers();
  }
}

export const setCurrentUser = (username: string): User => {
  const users = getUsers();
  const user = users.find(user => user.username === username);
  if(!user) {
    throw new Error("Cannot set current user if no local matching username is found");
  }
  return localStorage.setItem("modwatch.currentuser", JSON.stringify(username)), user
}

export const setUsers = (users: User[]): User[] => (
  localStorage.setItem("modwatch.users", JSON.stringify(users)), users
)

export const clearUsers = (): [] => (
  localStorage.setItem("modwatch.users", "[]"), []
);

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