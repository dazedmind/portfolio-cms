import { Router } from "express";
import { db } from "@/db/database";
import { systemPromptsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const prompt = await db.select().from(systemPromptsTable).where(eq(systemPromptsTable.user_id, id));
    return res.status(200).json(prompt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.profileId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const { prompt } = req.body;
    const updated = await db.update(systemPromptsTable).set({ prompt }).where(eq(systemPromptsTable.user_id, userId)).returning();
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = (req as any).user?.profileId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const created = await db.insert(systemPromptsTable).values({ prompt, user_id: userId }).returning();
    res.status(200).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;