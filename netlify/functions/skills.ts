import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { skillsTable } from '../../backend/src/db/schema.js';
import { and, asc, eq } from 'drizzle-orm';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, notFound, badRequest, handleCors } from './utils/response.js';

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
    // GET - Fetch skills for authenticated user
    if (event.httpMethod === 'GET') {
      console.log('📥 Fetching skills for user:', user.profileId);

      const skills = await db
        .select()
        .from(skillsTable)
        .where(eq(skillsTable.user_id, user.profileId))
        .orderBy(asc(skillsTable.id));

      console.log(`✅ Found ${skills.length} skills`);
      return success(skills);
    }

    // POST - Create new skill
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { skillName, skillCategory } = body;

      console.log('📦 Creating new skill');

      if (!skillName || !skillCategory) {
        return badRequest('Skill name and category are required');
      }

      const [created] = await db
        .insert(skillsTable)
        .values({
          name: skillName,
          category: skillCategory,
          user_id: user.profileId,
        })
        .returning();

      console.log('✅ Skill created successfully');
      return success(created, 201);
    }

    // DELETE - Delete skill
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const skillId = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(skillId)) {
        return badRequest('Invalid skill ID');
      }

      console.log(`🗑️  Deleting skill ${skillId}`);

      const deleted = await db
        .delete(skillsTable)
        .where(and(eq(skillsTable.id, skillId), eq(skillsTable.user_id, user.profileId)))
        .returning();

      if (deleted.length === 0) {
        return notFound('Skill not found');
      }

      console.log('✅ Skill deleted successfully');
      return success({ message: 'Skill deleted successfully' });
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Skills error:', err);
    return error('Internal server error', 500, err.message);
  }
};

