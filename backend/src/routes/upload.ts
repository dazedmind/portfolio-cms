import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";

const router = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Upload image to S3
 * POST /api/upload
 * Body: multipart/form-data with 'image' field and 'folder' field (optional)
 */
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("📥 Upload request received");
    console.log("👤 User:", (req as any).user);
    console.log("📦 File:", req.file ? req.file.originalname : "No file");
    console.log("📂 Folder:", req.body.folder);
    
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.body.folder || "uploads";
    
    // Upload to S3
    const fileUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    console.log("✅ Upload complete, sending response");
    res.json({ url: fileUrl });
  } catch (error: any) {
    console.error("❌ Error uploading file:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to upload file",
      details: error.message 
    });
  }
});

/**
 * Delete image from S3
 * DELETE /api/upload
 * Body: { url: string }
 */
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    await deleteFromS3(url);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;

