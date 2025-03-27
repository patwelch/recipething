// src/utils/hash.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Cost factor for hashing (higher is slower but more secure)

/**
 * Hashes a plain text password.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves with the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password entered by the user.
 * @param hash - The hashed password stored in the database.
 * @returns A promise that resolves with true if the passwords match, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};