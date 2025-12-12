import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { employmentsTable } from '../../backend/src/db/schema.js';
import { and, desc, eq } from 'drizzle-orm';
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
    // GET - Fetch employment entries for authenticated user
    if (event.httpMethod === 'GET') {
      console.log('📥 Fetching employments for user:', user.profileId);

      const employments = await db
        .select({
          id: employmentsTable.id,
          company: employmentsTable.company,
          position: employmentsTable.position,
          description: employmentsTable.description,
          startDate: employmentsTable.startDate,
          endDate: employmentsTable.endDate,
          isActive: employmentsTable.isActive,
        })
        .from(employmentsTable)
        .where(eq(employmentsTable.user_id, user.profileId))
        .orderBy(desc(employmentsTable.id));

      console.log(`✅ Found ${employments.length} employments`);
      return success(employments);
    }

    // POST - Create new employment
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { company, position, description, startDate, endDate, isActive } = body;

      console.log('📦 Creating new employment');
      console.log('📅 Dates received - Start:', startDate, 'End:', endDate, 'Active:', isActive);

      if (!company || !position || !description || !startDate) {
        return badRequest('Company, position, description, and start date are required');
      }

      if (!isActive && !endDate) {
        return badRequest('End date is required when not currently active');
      }

      const [employment] = await db
        .insert(employmentsTable)
        .values({
          company,
          position,
          description,
          startDate,
          endDate: isActive ? null : endDate,
          isActive,
          user_id: user.profileId,
        })
        .returning();

      console.log('✅ Employment created successfully');
      return success(employment, 201);
    }

    // PUT - Update employment
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const employmentId = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(employmentId)) {
        return badRequest('Invalid employment ID');
      }

      const body = JSON.parse(event.body || '{}');
      const { company, position, description, startDate, endDate, isActive } = body;

      console.log(`📝 Updating employment ${employmentId}`);
      console.log('📅 Dates received - Start:', startDate, 'End:', endDate, 'Active:', isActive);

      if (!company || !position || !description || !startDate) {
        return badRequest('Company, position, description, and start date are required');
      }

      if (!isActive && !endDate) {
        return badRequest('End date is required when not currently active');
      }

      const updated = await db
        .update(employmentsTable)
        .set({
          company,
          position,
          description,
          startDate,
          endDate: isActive ? null : endDate,
          isActive,
        })
        .where(and(eq(employmentsTable.id, employmentId), eq(employmentsTable.user_id, user.profileId)))
        .returning();

      if (updated.length === 0) {
        return notFound('Employment not found');
      }

      console.log('✅ Employment updated successfully');
      return success(updated[0]);
    }

    // DELETE - Delete employment
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const employmentId = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(employmentId)) {
        return badRequest('Invalid employment ID');
      }

      console.log(`🗑️  Deleting employment ${employmentId}`);

      const deleted = await db
        .delete(employmentsTable)
        .where(and(eq(employmentsTable.id, employmentId), eq(employmentsTable.user_id, user.profileId)))
        .returning();

      if (deleted.length === 0) {
        return notFound('Employment not found');
      }

      console.log('✅ Employment deleted successfully');
      return success({ message: 'Employment deleted successfully' });
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Employment error:', err);
    return error('Internal server error', 500, err.message);
  }
};
