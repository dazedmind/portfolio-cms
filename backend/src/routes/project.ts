import { Router } from "express";
import { db } from "@/db/database";
import { projectsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

// Create new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Expecting fields from client form
    const { projectName, projectDescription, projectLink, projectTechnologies, projectType, image } = req.body ?? {};

    if (!projectName || !projectDescription || !projectLink || !projectTechnologies || !projectType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // user_id from JWT middleware
    const userId = (req as any).user?.profileId;
    if (!userId) {
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
      })
      .returning();

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user's projects
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const userId = (req as any).user?.profileId;
//     if (!userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     const projects = await db.select().from(projectsTable).where(eq(projectsTable.user_id, userId));
//     res.json(projects);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const project = await db.select().from(projectsTable).where(eq(projectsTable.user_id, id));
    return res.status(200).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.profileId;
    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const { name, description, image, link, technologies, type } = req.body;
    const updated = await db
      .update(projectsTable)
      .set({ name, description, image, link, technologies, type })
      .where(and(eq(projectsTable.id, id), eq(projectsTable.user_id, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(updated[0]);
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