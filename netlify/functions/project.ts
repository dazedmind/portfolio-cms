import type { Handler, HandlerEvent } from '@netlify/functions';
import { db } from '../../backend/src/db/database.js';
import { projectsTable } from '../../backend/src/db/schema.js';
import { and, desc, eq } from 'drizzle-orm';
import { validateAuth } from './utils/auth.js';
import { success, error, unauthorized, notFound, badRequest, handleCors } from './utils/response.js';

// Helper to map snake_case to camelCase
function mapProject(project: any) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    link: project.link,
    technologies: project.technologies,
    type: project.type,
    image: project.image,
    hasArticle: project.has_article,
    articleLink: project.article_link || "",
  };
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
    // GET - Fetch all projects for user OR single project
    if (event.httpMethod === 'GET') {
      const pathParts = event.path.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      
      // Check if requesting specific project or all projects
      const projectId = parseInt(lastPart);
      
      if (!isNaN(projectId)) {
        // Get specific project
        const projects = await db
          .select()
          .from(projectsTable)
          .where(and(eq(projectsTable.id, projectId), eq(projectsTable.user_id, user.profileId)))
          .limit(1);

        if (projects.length === 0) {
          return notFound('Project not found');
        }

        return success(mapProject(projects[0]));
      } else {
        // Get all projects for user
        const projects = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.user_id, user.profileId))
          .orderBy(desc(projectsTable.id));

        const mappedProjects = projects.map(mapProject);
        return success(mappedProjects);
      }
    }

    // POST - Create new project
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { projectName, projectDescription, projectLink, projectTechnologies, projectType, image, hasArticle, articleLink } = body;

      console.log('📦 Creating new project');

      if (!projectName || !projectDescription || !projectLink || !projectTechnologies || !projectType) {
        return badRequest('Missing required fields');
      }

      const [created] = await db
        .insert(projectsTable)
        .values({
          name: projectName,
          description: projectDescription,
          link: projectLink,
          technologies: projectTechnologies,
          type: projectType,
          image: image ?? "",
          user_id: user.profileId,
          has_article: hasArticle ?? false,
          article_link: articleLink ?? null,
        })
        .returning();

      console.log('✅ Project created successfully');
      return success(mapProject(created), 201);
    }

    // PUT - Update project
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const projectId = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(projectId)) {
        return badRequest('Invalid project ID');
      }

      const body = JSON.parse(event.body || '{}');
      const { projectName, projectDescription, projectLink, projectTechnologies, projectType, image, hasArticle, articleLink } = body;

      console.log(`📝 Updating project ${projectId}`);

      const updated = await db
        .update(projectsTable)
        .set({
          name: projectName,
          description: projectDescription,
          image: image ?? "",
          link: projectLink,
          technologies: projectTechnologies,
          type: projectType,
          has_article: hasArticle ?? false,
          article_link: articleLink ?? null
        })
        .where(and(eq(projectsTable.id, projectId), eq(projectsTable.user_id, user.profileId)))
        .returning();

      if (updated.length === 0) {
        return notFound('Project not found');
      }

      console.log('✅ Project updated successfully');
      return success(mapProject(updated[0]));
    }

    // DELETE - Delete project
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/');
      const projectId = parseInt(pathParts[pathParts.length - 1]);

      if (isNaN(projectId)) {
        return badRequest('Invalid project ID');
      }

      console.log(`🗑️  Deleting project ${projectId}`);

      const deleted = await db
        .delete(projectsTable)
        .where(and(eq(projectsTable.id, projectId), eq(projectsTable.user_id, user.profileId)))
        .returning();

      if (deleted.length === 0) {
        return notFound('Project not found');
      }

      console.log('✅ Project deleted successfully');
      return success({ message: 'Project deleted successfully' });
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('❌ Project error:', err);
    return error('Internal server error', 500, err.message);
  }
};

