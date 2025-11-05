import { Router } from "express";
import { db } from "@/db/database";
import { employmentsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!id) {
//       return res.status(401).json({ error: "Unauthorized, please login again" });
//     }
//     const employments = await db.select().from(employmentsTable).where(eq(employmentsTable.user_id, parseInt(id))).orderBy(asc(employmentsTable.id));
//     if (employments.length === 0) {
//       return res.status(404).json({ error: "No employments found" });
//     }
//     return res.status(200).json(employments);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user?.profileId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const employments = await db.select().from(employmentsTable).where(eq(employmentsTable.user_id, userId));
      res.json(employments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { company, position, description, startDate, endDate, isActive } = req.body;
    if (!company || !position || !description || !startDate || (endDate && !isActive)) {
      return res.status(400).json({ error: "All fields are required except endDate if isActive is false" });
    }
    const userId = (req as any).user?.profileId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const employment = await db.insert(employmentsTable).values({ company, position, description, startDate, endDate, isActive, user_id: userId });
    return res.status(200).json({ message: "Employment added successfully", employment });
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
        .delete(employmentsTable)
        .where(and(eq(employmentsTable.id, id), eq(employmentsTable.user_id, userId)))
        .returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Employment not found" });
      }
      return res.status(200).json({ message: "Employment deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;