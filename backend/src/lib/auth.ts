import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

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
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log(decoded);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}


export function decodeToken(token: string): { profileId?: number } {
  try {
    const payload = token.split(".")[1];
    if (!payload) return { profileId: undefined };
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as { profileId?: number };
  } catch {
    return { profileId: undefined };
  }
}
