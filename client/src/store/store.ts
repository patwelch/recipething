// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import recipeReducer from './slices/recipeSlice.ts'; // <-- Import recipe reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer, // <-- Add recipe reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;