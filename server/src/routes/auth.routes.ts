// src/routes/auth.routes.ts
import { Router } from 'express';
// Import controllers and middleware as before
import { signup, login, getCurrentUser } from '../controllers/auth.controller';
import { protect } from '../config/passport';

// Use require for express-validator
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { body } = require('express-validator'); // <-- Use require here

const router = Router();

// --- Public Routes ---

// POST /api/auth/signup
router.post(
  '/signup',
  // body() should now work as obtained via require
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  // body() should now work as obtained via require
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  login
);

// --- Protected Routes ---
router.get('/me', protect, getCurrentUser);

export default router;