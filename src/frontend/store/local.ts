import { UploadUser } from "../../types";

export const getUsers = (): UploadUser[] => {
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
};

export const setCurrentUser = (username: string): UploadUser => {
  const users = getUsers();
  const user = users.find(user => user.username === username);
  if(!user) {
    throw new Error("Cannot set current user if no local matching username is found");
  }
  return localStorage.setItem("modwatch.currentuser", JSON.stringify(username)), user
};

export const setUsers = (users: UploadUser[]): UploadUser[] => (
  localStorage.setItem("modwatch.users", JSON.stringify(users)), users
);

export const clearUsers = (): [] => (
  localStorage.setItem("modwatch.users", "[]"), []
);

export const getUserState = (): UploadUser | {} => {
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

export const setUserState = (user): UploadUser | {} => {
  localStorage.setItem("modwatch.user", JSON.stringify(user));
  const users = getUsers();
  const userIndex = users.findIndex(({ username }) => user.username === username)
  if(userIndex !== -1) {
    setUsers([
      ...users.slice(0, userIndex),
      user,
      ...users.slice(userIndex + 1)
    ])
  } else {
    setUsers(
      users.concat(user)
    );
  }
  return user;
};

export const clearUserState = (): {} => (
  localStorage.setItem("modwatch.user", "{}"), {}
);
