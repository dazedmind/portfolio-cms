import { Router } from "express";
import { loginRoute } from "../controllers/auth.controller";

const router = Router();

// POST /api/login
router.post("/", loginRoute);

export default router;
