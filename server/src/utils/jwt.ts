// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

interface UserPayload {
    sub: string; // Subject (User ID)
    email: string;
    // Add other non-sensitive payload data if needed
}

/**
 * Creates a JWT for a given user.
 * @param user - The user object (must contain id and email).
 * @returns The generated JWT string.
 */
export const createToken = (user: { id: string; email: string }): string => {
    const payload: UserPayload = {
        sub: user.id,
        email: user.email,
        // You can add other claims here, like roles, but keep payload small and non-sensitive
    };

    // Sign the token with the secret and set an expiration time (e.g., '1d', '7h')
    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '1d', // Example: token expires in 1 day
    });

    return token;
};

// You could also add a function here to verify tokens if needed outside Passport
// export const verifyToken = (token: string): UserPayload | null => { ... };