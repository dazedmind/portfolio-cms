// auth.controller.ts
import type { Request, Response } from "express";
import { db } from '@/db/database'
import { profileTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createToken } from "@/lib/auth";

/**
 * Login API Route
 * POST /api/login
 * Body: { accessKey: string }
 * 
 * Validates access key from profileTable and returns JWT token with profile info
 */
export async function loginRoute(req: Request, res: Response): Promise<void> {
    try {
        const { accessKey } = req.body;

        // Validate access key is provided
        if (!accessKey) {
            res.status(400).json({ error: "Access key is required" });
            return;
        }

        // Try access key first, then fall back to API key
        let profiles = await db
            .select()
            .from(profileTable)
            .where(eq(profileTable.access_key, accessKey))
            .limit(1);

        // Check if profile exists
        if (profiles.length === 0) {
            res.status(401).json({ error: "Invalid access key" });
            return;
        }

        const profile = profiles[0];

        // Create JWT token with unique profile information
        const token = createToken({
            profileId: profile.id,
            email: profile.email,
            name: profile.name,
            accessKey: profile.access_key,
        });

        // Return success response with token
        res.status(200).json({
            message: "Login successful",
            token,
            profile: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                title: profile.title,
                image: profile.image,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        
        // Check if it's a database connection error
        if (error instanceof Error) {
            const errorMessage = error.message;
            if (
                errorMessage.includes('ECONNRESET') ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('connection') ||
                errorMessage.includes('timeout')
            ) {
                console.error("Database connection error:", error);
                res.status(503).json({ 
                    error: "Database connection error. Please try again.",
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                });
                return;
            }
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
}
