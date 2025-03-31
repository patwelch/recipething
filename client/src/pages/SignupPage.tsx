// src/pages/SignupPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store.ts';
import { setCredentials, setLoading } from '../store/slices/authSlice.ts';
import apiClient from '../services/api.ts';

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password
    const [error, setError] = useState<string | null>(null);

    const dispatch: AppDispatch = useDispatch();
    const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to dashboard if logged in
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        // Basic client-side validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
             setError("Password must be at least 6 characters long.");
             return;
        }

        dispatch(setLoading(true));

        try {
            // Call the signup API endpoint
            const response = await apiClient.post('/auth/signup', {
                email,
                password,
            });

            if (response.data && response.data.token && response.data.user) {
                // Dispatch action to update Redux state and localStorage
                dispatch(setCredentials(response.data));
                // Navigate to the dashboard after successful signup
                navigate('/');
            } else {
                throw new Error('Invalid signup response from server.');
            }

        } catch (err: any) {
            console.error('Signup failed:', err);
            const message = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
            // Handle specific validation errors from backend if available
             if (err.response?.data?.errors) {
                 // Assuming errors is an array like from express-validator
                 const formattedErrors = err.response.data.errors.map((e: any) => e.msg).join(' ');
                 setError(formattedErrors || message);
             } else {
                setError(message);
             }
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Account</h2>
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
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
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
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                            placeholder="Password (min. 6 characters)"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                            placeholder="Confirm Password"
                        />
                    </div>


                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md group hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-gray-600 hover:text-gray-500">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;