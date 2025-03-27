// /server/src/@types/express/index.d.ts

// Import the User type from Prisma (adjust path if needed, but @prisma/client should work)
import { User as PrismaUser } from '@prisma/client';

// Define a type for the user object attached to the request, excluding the password
// Ensure PrismaUser actually has 'id' (it should based on our schema)
type RequestUser = Omit<PrismaUser, 'password'>;

// Tell TypeScript that the Express Request interface might have a 'user' property
declare global {
  namespace Express {
    export interface Request {
      user?: RequestUser; // Make it optional '?' because it's only present after 'protect' middleware
    }
  }
}

// Ensures the file is treated as a module.
export {};