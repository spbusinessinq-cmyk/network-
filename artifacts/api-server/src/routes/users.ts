import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

function toFrontendUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    alias: u.alias,
    bio: u.bio,
    statusLine: u.statusLine,
    rsrId: u.rsrId,
    role: u.role,
    standing: u.standing,
    grade: u.grade,
    cardStyle: u.cardStyle,
    accessClass: u.accessClass,
    credentialMeaning: u.credentialMeaning,
    presence: u.presence,
    joinDate: u.joinDate,
    contributionCount: u.contributionCount,
    promotionStatus: u.promotionStatus,
    reviewStatus: u.reviewStatus,
    isFounder: u.isFounder,
    username: u.username,
  };
}

// GET /api/users
router.get("/", requireAuth, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(toFrontendUser));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const results = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id)).limit(1);
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json(toFrontendUser(results[0]));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
