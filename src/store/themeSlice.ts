import { createSlice } from '@reduxjs/toolkit';

type ThemeValue = 'light' | 'dark';

interface ThemeState {
  value: ThemeValue;
}

const initialState: ThemeState = {
  value: 'light',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.value = state.value === 'light' ? 'dark' : 'light';
    },
  },
  selectors: {
    selectTheme: (state) => state.value,
  },
});

export const { toggleTheme } = themeSlice.actions;
export const { selectTheme } = themeSlice.selectors;
