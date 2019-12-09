import createStore from "unistore";
import jwtDecode from "jwt-decode";

import { Notification, User, RemoveFirstFromTuple } from "@modwatch/types";
import { addNotification, removeNotification } from "@modwatch/core/src/store/index";

import { clearUserState, setUserState, getUserState } from "./local";
import { getToken } from "./ipc";

const localUser = getUserState();

export type GlobalState = {
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
    return {
      ...state,
      user: clearUserState()
    };
  },
  addNotification,
  removeNotification
});