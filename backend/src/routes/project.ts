import { Router } from "express";
import { db } from "@/db/database";
import { projectsTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

// Create new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("📦 Creating new project, received data:", req.body);
    
    // Expecting fields from client form
    const { projectName, projectDescription, projectLink, projectTechnologies, projectType, image, hasArticle, articleLink } = req.body ?? {};

    console.log("🖼️  Image URL received:", image);

    if (!projectName || !projectDescription || !projectLink || !projectTechnologies || !projectType) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // user_id from JWT middleware
    const userId = (req as any).user?.profileId;
    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({ error: "Unauthorized" });
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
        user_id: userId,
        has_article: hasArticle ?? false,
        article_link: articleLink ?? null,
      })
      .returning();

    // Map snake_case to camelCase for frontend
    const mappedProject = {
      id: created.id,
      name: created.name,
      description: created.description,
      link: created.link,
      technologies: created.technologies,
      type: created.type,
      image: created.image,
      hasArticle: created.has_article,
      articleLink: created.article_link || "",
    };

    console.log("✅ Project created successfully:", mappedProject);
    return res.status(201).json(mappedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user's projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.profileId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.user_id, userId))
      .orderBy(desc(projectsTable.id));

    // Map snake_case to camelCase for frontend
    const mappedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      link: project.link,
      technologies: project.technologies,
      type: project.type,
      image: project.image,
      hasArticle: project.has_article,
      articleLink: project.article_link || "",
    }));

    res.json(mappedProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.user_id, id))
      .orderBy(desc(projectsTable.id));

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// router.get(process.env.REQUEST_ORIGIN === "cms-api" ? "/" : "/:id", authMiddleware, async (req, res) => {
//   try {
//     const id = process.env.REQUEST_ORIGIN === "cms-api" ? (req as any).user?.profileId : parseInt(req.params.id);
//     if (!id) {
//       return res.status(401).json({ error: "Unauthorized, please login again" });
//       }
//       const project = await db.select().from(projectsTable).where(eq(projectsTable.user_id, id)).orderBy(desc(projectsTable.id));
//       return res.status(200).json(project);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   });

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.profileId;
    
    console.log(`📝 Updating project ${id}, received data:`, req.body);
    console.log("🖼️  Image URL received:", req.body.image);
    
    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const { projectName, projectDescription, projectLink, projectTechnologies, projectType, image, hasArticle, articleLink } = req.body ?? {};
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
      .where(and(eq(projectsTable.id, id), eq(projectsTable.user_id, userId)))
      .returning();

    if (updated.length === 0) {
      console.log("❌ Project not found");
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Map snake_case to camelCase for frontend
    const mappedProject = {
      id: updated[0].id,
      name: updated[0].name,
      description: updated[0].description,
      link: updated[0].link,
      technologies: updated[0].technologies,
      type: updated[0].type,
      image: updated[0].image,
      hasArticle: updated[0].has_article,
      articleLink: updated[0].article_link || "",
    };
    
    console.log("✅ Project updated successfully:", mappedProject);
    res.json(mappedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.profileId;
    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const deleted = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.user_id, userId)))
      .returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;