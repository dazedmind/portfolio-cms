import { Router } from "express";
import { db } from "@/backend/db/database";
import { profileTable } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const profile = await db.select().from(profileTable).where(eq(profileTable.id, id)).limit(1);
    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
