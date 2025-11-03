import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/lib/auth';
import type { JwtPayload } from '@/lib/auth';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Validates the JWT token from Authorization header and attaches user info to request
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header provided' });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    // Continue to next middleware/route
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

