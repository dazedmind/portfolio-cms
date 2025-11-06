import { Router } from 'express';
import { db } from '@/db/database';
import { profileTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

function generateApiKey(): string {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Get current user's API key (uses api_key column)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.profileId as number | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await db.select({ api_key: profileTable.api_key })
      .from(profileTable)
      .where(eq(profileTable.id, userId))
      .limit(1);

    if (result.length === 0) return res.status(404).json({ error: 'Profile not found' });
    return res.json({ apiKey: result[0].api_key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Rotate/regenerate API key (overwrites api_key)
router.post('/rotate', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.profileId as number | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const newKey = generateApiKey();
    const updated = await db.update(profileTable)
      .set({ api_key: newKey })
      .where(eq(profileTable.id, userId))
      .returning({ api_key: profileTable.api_key });

    if (updated.length === 0) return res.status(404).json({ error: 'Profile not found' });
    return res.status(200).json({ apiKey: updated[0].api_key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


