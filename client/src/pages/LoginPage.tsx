// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store.ts';
import { setCredentials, setLoading } from '../store/slices/authSlice.ts'; // Import the authSlice actions
import apiClient from '../services/api.ts'; // Your configured Axios instance

const LoginPage: React.FC = () => {
    // Local state for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null); // Local error state for the form

    // Redux state and dispatch
    const dispatch: AppDispatch = useDispatch();
    const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // React Router hooks for navigation and location
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"; // Get redirect path or default to dashboard

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); // Clear previous errors
        dispatch(setLoading(true));

        try {
            // Call the login API endpoint
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            // Assuming backend returns { token: string, user: User } on success
            if (response.data && response.data.token && response.data.user) {
                // Dispatch action to update Redux state and localStorage
                dispatch(setCredentials(response.data));
                // Navigate to the intended page or dashboard
                navigate(from, { replace: true });
            } else {
                // Handle unexpected response format
                throw new Error('Invalid login response from server.');
            }

        } catch (err: any) {
            console.error('Login failed:', err);
            // Extract error message from Axios response or use a generic one
            const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(message);
            dispatch(setLoading(false)); // Ensure loading is set to false on error
        }
        // Removed redundant setLoading(false) here, handled in success/error paths
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust height based on layout */}
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Login to Your Account</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-red-800 bg-red-100 border border-red-400 rounded">
                            {error}
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Password"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;