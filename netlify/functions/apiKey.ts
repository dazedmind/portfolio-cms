import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { profileTable } from '../../backend/src/db/schema.js';
import { eq } from 'drizzle-orm';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, notFound, handleCors } from './utils/response.js';

function generateApiKey(): string {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  const user = await validateAuth(event);
  if (!user) {
    return unauthorized();
  }

  try {
    // GET - Get current user's API key
    if (event.httpMethod === 'GET') {
      const result = await db
        .select({ api_key: profileTable.api_key })
        .from(profileTable)
        .where(eq(profileTable.id, user.profileId))
        .limit(1);

      if (result.length === 0) {
        return notFound('Profile not found');
      }

      return success({ apiKey: result[0].api_key });
    }

    // POST - Rotate/regenerate API key
    if (event.httpMethod === 'POST') {
      const newKey = generateApiKey();

      console.log('🔄 Rotating API key for user:', user.profileId);

      const updated = await db
        .update(profileTable)
        .set({ api_key: newKey })
        .where(eq(profileTable.id, user.profileId))
        .returning({ api_key: profileTable.api_key });

      if (updated.length === 0) {
        return notFound('Profile not found');
      }

      console.log('✅ API key rotated successfully');
      return success({ apiKey: updated[0].api_key });
    }

    // DELETE - Delete API key
    if (event.httpMethod === 'DELETE') {
      const updated = await db
        .update(profileTable)
        .set({ api_key: "" })
        .where(eq(profileTable.id, user.profileId))
        .returning({ api_key: profileTable.api_key });

      if (updated.length === 0) {
        return notFound('Profile not found');
      }

      console.log('✅ API key deleted successfully');
      return success({ message: 'API key deleted successfully' });
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ API key error:', err);
    return error('Internal server error', 500, err.message);
  }
};

