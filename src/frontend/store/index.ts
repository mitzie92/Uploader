import createStore from "unistore";
import jwtDecode from "jwt-decode";

import { Notification, User, RemoveFirstFromTuple } from "@modwatch/types";
import { addNotification, removeNotification } from "@modwatch/core/src/store/index";

import { clearUserState, setUserState, getUserState, getUsers } from "./local";
import { getToken } from "./ipc";

const localUser = getUserState();
const localUsers = getUsers();

export type GlobalState = {
  users: User[];
  user: User;
  notifications: Notification[];
  awaitingIpc: boolean;
}
export type GlobalActions = {
  login(props?: {token: string}): Promise<void>,
  logout(): void,
  addNotification(...args: RemoveFirstFromTuple<Parameters<typeof addNotification>>): void,
  removeNotification(...args: RemoveFirstFromTuple<Parameters<typeof removeNotification>>): void
};

export const rawState: GlobalState = {
  users: localUsers,
  user: {
    username: undefined,
    scopes: [],
    ...localUser,
    authenticated: false
  },
  awaitingIpc: false,
  notifications: []
};

let _store = createStore(rawState);

export const store = _store;

export const actions = store => ({
  async login(state: GlobalState, props?: {
    token: string
  }) {
    let { token } = props || {};
    if(!token) {
      store.setState({
        awaitingIpc: true
      });
      try {
        token = await getToken();
      } catch(e) {
        store.setState({
          awaitingIpc: false,
          ...state,
          user: clearUserState()
        });
        throw e;
      }
      store.setState({
        awaitingIpc: false
      });
    }
    const { sub, scopes } = jwtDecode(token);
    const user = {
      token,
      authenticated: true,
      username: sub,
      scopes
    };
    setUserState(user);
    return {
      ...state,
      user
    };
  },
  logout(state: GlobalState) {
    const userIndex = state.users.findIndex(({ username }) => username === state.user.username);
    return {
      ...state,
      user: clearUserState(),
      users: userIndex !== -1 ? [
        ...state.users.slice(0, userIndex),
        ...state.users.slice(userIndex + 1)
      ] : state.users
    };
  },
  addNotification,
  removeNotification
});