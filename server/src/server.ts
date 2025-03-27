// src/server.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport'; // Import passport configuration
import authRoutes from './routes/auth.routes'; // Import auth routes
import recipeRoutes from './routes/recipe.routes'; // Import recipe routes
import { errorHandler } from './middleware/errorHandler'; // Import error handler

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app: Express = express();

// Define the port the server will run on, using environment variable or default
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable CORS for all origins (adjust origins in production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Initialize Passport (important: before routes that use authentication)
app.use(passport.initialize());

// --- Basic Routes (Example) ---
app.get('/', (req: Request, res: Response) => {
  res.send('Recipe App Backend is Running!');
});

// --- API Routes ---
app.use('/api/auth', authRoutes); // Use the authentication routes
app.use('/api/recipes', recipeRoutes);
// Add other resource routes here later (e.g., /api/recipes)


// --- Error Handling Middleware (MUST be LAST) ---
// Any errors passed via next(error) will be caught by this
app.use(errorHandler);


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

export default app; // Optional: export for testing