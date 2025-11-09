import { Router } from "express";
import { db } from "@/db/database";
import { employmentsTable } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({ error: "Unauthorized, please login again" });
    }
    const employments = await db.select().from(employmentsTable).where(eq(employmentsTable.user_id, parseInt(id))).orderBy(asc(employmentsTable.id));
    if (employments.length === 0) {
      return res.status(404).json({ error: "No employments found" });
    }
    return res.status(200).json(employments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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
    console.log("📦 Creating new employment, received data:", req.body);
    
    const { company, position, description, startDate, endDate, isActive } = req.body;
    
    console.log("📅 Dates received - Start:", startDate, "End:", endDate, "Active:", isActive);
    
    if (!company || !position || !description || !startDate) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Company, position, description, and start date are required" });
    }
    
    // If not currently active, endDate is required
    if (!isActive && !endDate) {
      console.log("❌ End date required when not currently active");
      return res.status(400).json({ error: "End date is required when not currently active" });
    }
    
    const userId = (req as any).user?.profileId;
    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const employment = await db.insert(employmentsTable).values({ 
      company, 
      position, 
      description, 
      startDate, 
      endDate: isActive ? null : endDate, 
      isActive, 
      user_id: userId 
    }).returning();
    
    console.log("✅ Employment created successfully:", employment[0]);
    return res.status(200).json(employment[0]);
  } catch (err) {
    console.error("❌ Error creating employment:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`📝 Updating employment ${req.params.id}, received data:`, req.body);
    
    const { company, position, description, startDate, endDate, isActive } = req.body;
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.profileId;
    
    console.log("📅 Dates received - Start:", startDate, "End:", endDate, "Active:", isActive);
    
    if (!userId || !Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    
    const updated = await db
      .update(employmentsTable)
      .set({ 
        company, 
        position, 
        description, 
        startDate, 
        endDate: isActive ? null : endDate, 
        isActive 
      })
      .where(and(eq(employmentsTable.id, id), eq(employmentsTable.user_id, userId)))
      .returning();
    
    if (updated.length === 0) {
      console.log("❌ Employment not found");
      return res.status(404).json({ error: "Employment not found" });
    }
    
    console.log("✅ Employment updated successfully:", updated[0]);
    return res.status(200).json(updated[0]);
  } catch (err) {
    console.error("❌ Error updating employment:", err);
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