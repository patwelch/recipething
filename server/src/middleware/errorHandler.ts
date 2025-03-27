// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
    // Add other custom properties if needed
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR:", err.stack || err); // Log the error stack for debugging

    const statusCode = err.statusCode || 500; // Default to Internal Server Error
    const message = err.message || 'Something went wrong on the server.';

    res.status(statusCode).json({
        message,
        // Optionally include stack trace in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};