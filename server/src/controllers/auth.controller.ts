// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
// import { validationResult } from 'express-validator'; // Remove or comment out this line
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { validationResult } = require('express-validator'); // <-- Use require here

import prisma from '../db';
import { hashPassword, comparePassword } from '../utils/hash';
import { createToken } from '../utils/jwt';

/**
 * Handles user signup.
 */
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // validationResult should now work correctly
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
  
    const { email, password } = req.body;
  
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
  
      if (existingUser) {
         res.status(409).json({ message: 'User already exists with this email.' });
         return;
      }
  
      const hashedPassword = await hashPassword(password);
      const newUser = await prisma.user.create({ data: { email, password: hashedPassword } });
      const token = createToken(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ token, user: userWithoutPassword });
  
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Handles user login.
   */
  export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // validationResult should now work correctly
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
  
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
         res.status(401).json({ message: 'Invalid email or password.' });
         return;
      }
  
      const isMatch = await comparePassword(password, user.password);
  
      if (!isMatch) {
         res.status(401).json({ message: 'Invalid email or password.' });
         return;
      }
  
      const token = createToken(user);
      const { password: __, ...userWithoutPassword } = user;
      res.status(200).json({ token, user: userWithoutPassword });
  
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Gets current user info based on JWT.
   */
  export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
          res.status(401).json({ message: 'Not authorized' });
          return;
      }
      res.status(200).json({ user: req.user });
  };