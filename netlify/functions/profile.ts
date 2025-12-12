import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { profileTable } from '../../backend/src/db/schema.js';
import { eq } from 'drizzle-orm';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, notFound, handleCors } from './utils/response.js';

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  const user = await validateAuth(event);
  if (!user) {
    return unauthorized();
  }

  // Extract ID from path: /api/profile/123
  const pathParts = event.path.split('/');
  const idParam = pathParts[pathParts.length - 1];
  const profileId = parseInt(idParam);

  if (isNaN(profileId)) {
    return error('Invalid profile ID', 400);
  }

  try {
    // GET - Fetch profile
    if (event.httpMethod === 'GET') {
      const profile = await db
        .select({
          id: profileTable.id,
          name: profileTable.name,
          title: profileTable.title,
          email: profileTable.email,
          image: profileTable.image,
          about: profileTable.about,
          github: profileTable.github,
          linkedin: profileTable.linkedin,
          behance: profileTable.behance,
          facebook: profileTable.facebook,
        })
        .from(profileTable)
        .where(eq(profileTable.id, profileId))
        .limit(1);

      if (profile.length === 0) {
        return notFound('Profile not found');
      }

      return success(profile[0]);
    }

    // PUT - Update profile
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { name, title, email, image, about, github, linkedin, behance, facebook } = body;

      console.log('📝 Updating profile:', profileId);

      const updated = await db
        .update(profileTable)
        .set({ name, title, email, image, about, github, linkedin, behance, facebook })
        .where(eq(profileTable.id, profileId))
        .returning({
          id: profileTable.id,
          name: profileTable.name,
          title: profileTable.title,
          email: profileTable.email,
          image: profileTable.image,
          about: profileTable.about,
          github: profileTable.github,
          linkedin: profileTable.linkedin,
          behance: profileTable.behance,
          facebook: profileTable.facebook,
        });

      if (updated.length === 0) {
        return notFound('Profile not found');
      }

      console.log('✅ Profile updated successfully');
      return success(updated[0]);
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Profile error:', err);
    return error('Internal server error', 500, err.message);
  }
};

