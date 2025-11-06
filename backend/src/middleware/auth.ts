import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/lib/auth';
import type { JwtPayload } from '@/lib/auth';
import { db } from '@/db/database';
import { profileTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { profileId?: number };
    }
  }
}

/**
 * Authentication Middleware (JWT + API Key)
 * Validates either a JWT or an API key from the Authorization header.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
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

    // 1️⃣ Try verifying JWT first
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
      return;
    } catch {
      // Not a JWT → continue to API key validation
    }

    // 2️⃣ Try validating API key
    const result = await db
      .select({ id: profileTable.id, email: profileTable.email, name: profileTable.name, access_key: profileTable.access_key })
      .from(profileTable)
      .where(eq(profileTable.api_key, token))
      .limit(1);

    if (result.length === 0) {
      res.status(401).json({ error: 'Invalid token or API key' });
      return;
    }

    // Attach profileId to request for downstream routes
    req.user = { profileId: result[0].id, email: result[0].email, name: result[0].name, accessKey: result[0].access_key };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
