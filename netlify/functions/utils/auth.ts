import jwt from 'jsonwebtoken';
import { db } from '../../../backend/src/db/database.js';
import { profileTable } from '../../../backend/src/db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JwtPayload {
  profileId: number;
  email: string;
  name: string;
  accessKey: string;
}

/**
 * Creates a JWT token with profile information
 */
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract and validate auth token from Netlify event
 * Returns user info or null if invalid
 */
export async function validateAuth(event: any): Promise<{ profileId: number; email: string; name: string } | null> {
  try {
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // Try JWT first
    try {
      const decoded = verifyToken(token);
      return { profileId: decoded.profileId, email: decoded.email, name: decoded.name };
    } catch {
      // Not a JWT, try API key
    }

    // Try API key (read-only)
    const result = await db
      .select({ id: profileTable.id, email: profileTable.email, name: profileTable.name })
      .from(profileTable)
      .where(eq(profileTable.api_key, token))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return { profileId: result[0].id, email: result[0].email, name: result[0].name };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Check if request is using API key (read-only access)
 */
export async function isApiKey(token: string): Promise<boolean> {
  try {
    // Try to verify as JWT - if it fails, it's an API key
    verifyToken(token);
    return false;
  } catch {
    return true;
  }
}

