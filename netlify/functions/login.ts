import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { profileTable } from '../../backend/src/db/schema.js';
import { eq } from 'drizzle-orm';
import { createToken } from './utils/auth.js';
import { success, error, badRequest, handleCors } from './utils/response.js';

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { accessKey } = body;

    console.log('🔐 Login attempt');

    if (!accessKey) {
      return badRequest('Access key is required');
    }

    // Find profile by access key
    const profiles = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.access_key, accessKey))
      .limit(1);

    if (profiles.length === 0) {
      return error('Invalid access key', 401);
    }

    const profile = profiles[0];

    // Create JWT token
    const token = createToken({
      profileId: profile.id,
      email: profile.email,
      name: profile.name,
      accessKey: profile.access_key,
    });

    console.log('✅ Login successful for:', profile.email);

    return success({
      message: 'Login successful',
      token,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        title: profile.title,
        image: profile.image,
      },
    });
  } catch (err: any) {
    console.error('❌ Login error:', err);
    return error('Internal server error', 500, err.message);
  }
};

