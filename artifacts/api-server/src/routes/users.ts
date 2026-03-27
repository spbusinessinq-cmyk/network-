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

// PATCH /api/users/:id — update standing, grade, accessClass, role, reviewStatus, promotionStatus
router.patch("/:id", requireAuth, async (req: any, res) => {
  try {
    const callerResults = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id)).limit(1);
    const caller = callerResults[0];
    if (!caller || caller.standing !== "Command") {
      res.status(403).json({ error: "Command clearance required." });
      return;
    }

    const allowed = ["standing", "grade", "accessClass", "role", "reviewStatus", "promotionStatus", "bio", "statusLine"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update." });
      return;
    }

    const results = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.params.id)).returning();
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json(toFrontendUser(results[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/users/:id — Command only, cannot delete self
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const callerResults = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id)).limit(1);
    const caller = callerResults[0];
    if (!caller || caller.standing !== "Command") {
      res.status(403).json({ error: "Command clearance required." });
      return;
    }
    if (req.params.id === req.user.id) {
      res.status(400).json({ error: "Cannot remove your own account." });
      return;
    }

    const results = await db.delete(usersTable).where(eq(usersTable.id, req.params.id)).returning();
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
