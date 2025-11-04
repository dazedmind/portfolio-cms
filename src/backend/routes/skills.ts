import { Router } from "express";
import { db } from "@/backend/db/database";
import { skillsTable } from "@/backend/db/schema";
import { asc, eq } from "drizzle-orm";
import { authMiddleware } from "@/backend/middleware/auth";

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
      icon: iconName,
      category: skillCategory,
      user_id: userId,
    }).returning();
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;