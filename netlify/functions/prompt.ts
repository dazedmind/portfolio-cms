import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { systemPromptsTable } from '../../backend/src/db/schema.js';
import { eq } from 'drizzle-orm';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, badRequest, handleCors } from './utils/response.js';

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
    // GET - Fetch system prompt for authenticated user
    if (event.httpMethod === 'GET') {
      console.log('📥 Fetching system prompt for user:', user.profileId);

      const prompt = await db
        .select()
        .from(systemPromptsTable)
        .where(eq(systemPromptsTable.user_id, user.profileId));

      console.log(`✅ Found ${prompt.length} system prompts`);
      return success(prompt);
    }

    // POST - Create new system prompt
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { prompt } = body;

      console.log('📦 Creating new system prompt');

      if (!prompt) {
        return badRequest('Prompt is required');
      }

      const created = await db
        .insert(systemPromptsTable)
        .values({ prompt, user_id: user.profileId })
        .returning();

      console.log('✅ System prompt created successfully');
      return success(created);
    }

    // PUT - Update system prompt
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { prompt } = body;

      console.log('📝 Updating system prompt');

      if (!prompt) {
        return badRequest('Prompt is required');
      }

      const updated = await db
        .update(systemPromptsTable)
        .set({ prompt })
        .where(eq(systemPromptsTable.user_id, user.profileId))
        .returning();

      console.log('✅ System prompt updated successfully');
      return success(updated);
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Prompt error:', err);
    return error('Internal server error', 500, err.message);
  }
};

