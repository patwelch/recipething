// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the user object (adjust based on your backend response)
interface User {
    id: string;
    email: string;
    createdAt?: string; // Optional based on backend response/needs
    updatedAt?: string; // Optional
}

// Define the initial state shape
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Optional: for loading states during auth requests
}

// Retrieve token and user from localStorage on initial load (optional)
const storedToken = localStorage.getItem('authToken');
const storedUser = localStorage.getItem('authUser');

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken, // True if token exists
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action to handle starting login/signup
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        // Action to handle successful login/signup
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.isLoading = false;
            // Store credentials in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));
        },
        // Action to handle logout
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            // Remove credentials from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
        },
    },
});

// Export actions
export const { setLoading, setCredentials, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;