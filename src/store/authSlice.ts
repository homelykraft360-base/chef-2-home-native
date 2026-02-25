import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { Nullable, User } from '../types';

interface UserState {
  user: User | null;
  token: string | null;
  /** Set after login success modal "Book your first Session"; MainTabs switches to this tab then clears */
  postLoginTab: 'Booking' | null;
}

const initialState: UserState = {
  token: null,
  user: null,
  postLoginTab: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<Nullable<string>>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<Nullable<User>>) => {
      state.user = action.payload;
    },
    setPostLoginTab: (state, action: PayloadAction<'Booking' | null>) => {
      state.postLoginTab = action.payload;
    },
    signOutUser: (state) => {
      state.user = null;
      state.token = null;
      state.postLoginTab = null;
    },
  },
  selectors: {
    currentToken: (state) => state.token,
    currentUser: (state) => state.user,
    isAuthenticated: (state) => !!state.token && !!state.user,
    postLoginTab: (state) => state.postLoginTab,
  },
});

export const { setToken, setUser, setPostLoginTab, signOutUser } =
  authSlice.actions;
export const { currentToken, currentUser, isAuthenticated, postLoginTab } =
  authSlice.selectors;
