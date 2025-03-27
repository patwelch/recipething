// src/config/passport.ts
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import prisma from '../db'; // Import your Prisma client instance
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

// Options for the JWT Strategy
const options: StrategyOptions = {
  // Extract JWT from the Authorization header as a Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Use the secret key to verify the token's signature
  secretOrKey: jwtSecret,
};

// Define the JWT strategy
const strategy = new JwtStrategy(options, async (payload, done) => {
  // 'payload' is the decoded JWT payload (we'll put user ID in it during login)
  try {
    // Find the user based on the ID stored in the JWT payload
    const user = await prisma.user.findUnique({
      where: { id: payload.sub }, // 'sub' is typically used for subject (user ID)
    });

    if (user) {
      // If user is found, pass the user object to the next middleware/route handler
      // We exclude the password hash from the user object attached to the request
      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } else {
      // If user is not found (e.g., deleted after token was issued), indicate failure
      return done(null, false);
    }
  } catch (error) {
    // If there's an error during database lookup, pass the error
    return done(error, false);
  }
});

// Tell Passport to use the defined strategy
passport.use(strategy);

// Middleware function to protect routes
// It uses passport.authenticate with the 'jwt' strategy
// session: false indicates we are not using sessions, only tokens
export const protect = passport.authenticate('jwt', { session: false });

// Export passport itself if needed elsewhere, though often just 'protect' is used
export default passport;