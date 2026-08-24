import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { Nullable, User } from '../types';

interface UserState {
  user: User | null;
  token: string | null;
  /** Set after login success modal "Book your first Session"; MainTabs switches to this tab then clears */
  postLoginTab: 'Booking' | 'AcceptInvite' | null;
  /** Persisted invite token until address step completes (D-04) */
  pendingInviteToken: string | null;
  /** Cached from invite preview for member Home card (no payer GET) */
  cachedPayerFirstName: string | null;
}

const initialState: UserState = {
  token: null,
  user: null,
  postLoginTab: null,
  pendingInviteToken: null,
  cachedPayerFirstName: null,
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
    setPostLoginTab: (
      state,
      action: PayloadAction<'Booking' | 'AcceptInvite' | null>,
    ) => {
      state.postLoginTab = action.payload;
    },
    setPendingInviteToken: (state, action: PayloadAction<string | null>) => {
      state.pendingInviteToken = action.payload;
    },
    setCachedPayerFirstName: (state, action: PayloadAction<string | null>) => {
      state.cachedPayerFirstName = action.payload;
    },
    signOutUser: (state) => {
      state.user = null;
      state.token = null;
      state.postLoginTab = null;
      state.pendingInviteToken = null;
      state.cachedPayerFirstName = null;
    },
  },
  selectors: {
    currentToken: (state) => state.token,
    currentUser: (state) => state.user,
    isAuthenticated: (state) => !!state.token && !!state.user,
    postLoginTab: (state) => state.postLoginTab,
  },
});

export const {
  setToken,
  setUser,
  setPostLoginTab,
  setPendingInviteToken,
  setCachedPayerFirstName,
  signOutUser,
} = authSlice.actions;
export const {
  currentToken,
  currentUser,
  isAuthenticated,
  postLoginTab,
} = authSlice.selectors;
