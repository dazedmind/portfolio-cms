import { Router } from "express";
import { db } from "../db/database.js";
import { skillsTable } from "../db/schema.js";
import { and, asc, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Get all skills
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const skills = await db.select().from(skillsTable).where(eq(skillsTable.user_id, parseInt(id))).orderBy(asc(skillsTable.id));
    return res.status(200).json(skills);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { skillName, iconName, skillCategory } = req.body;
    const userId = (req as any).user?.profileId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [created] = await db.insert(skillsTable).values({
      name: skillName,
      category: skillCategory,
      user_id: userId,
    }).returning();
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
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
      .delete(skillsTable)
      .where(and(eq(skillsTable.id, id), eq(skillsTable.user_id, userId)))
      .returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }
    return res.status(200).json({ message: "Skill deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;