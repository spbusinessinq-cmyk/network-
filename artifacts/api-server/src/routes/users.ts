import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { takeFirst } from "../lib/params.js";

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
    status: (u as any).status || "active",
    isFounder: u.isFounder,
    username: u.username,
  };
}

// GET /api/users
router.get("/", requireAuth, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(toFrontendUser));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = takeFirst(req.params.id) ?? "";
    const results = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json(toFrontendUser(results[0]));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/:id — Command only, or self-service for promotionStatus
router.patch("/:id", requireAuth, async (req: any, res) => {
  try {
    const callerId = req.user.id || req.user.userId;
    const callerResults = await db.select().from(usersTable).where(eq(usersTable.id, callerId)).limit(1);
    const caller = callerResults[0];
    if (!caller) { res.status(403).json({ error: "Caller not found." }); return; }

    const isCommand = caller.standing === "Command";
    const isSelf = req.params.id === callerId;

    // Self-service: operators can only update their own promotionStatus to "Under Review"
    if (!isCommand) {
      if (!isSelf) { res.status(403).json({ error: "Command clearance required." }); return; }
      const { promotionStatus } = req.body;
      if (promotionStatus !== "Under Review") {
        res.status(403).json({ error: "You may only submit a promotion request." });
        return;
      }
      const results = await db.update(usersTable)
        .set({ promotionStatus: "Under Review" })
        .where(eq(usersTable.id, req.params.id))
        .returning();
      if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
      res.json(toFrontendUser(results[0]));
      return;
    }

    // Command: full update access
    const commandAllowed = ["standing", "grade", "accessClass", "role", "reviewStatus", "promotionStatus", "bio", "statusLine", "alias", "status", "presence"];
    const updates: Record<string, any> = {};
    for (const key of commandAllowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update." });
      return;
    }

    const results = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.params.id)).returning();
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json(toFrontendUser(results[0]));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/users/:id — Command only, cannot delete self, cannot delete other founders
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const callerId = req.user.id || req.user.userId;
    const callerResults = await db.select().from(usersTable).where(eq(usersTable.id, callerId)).limit(1);
    const caller = callerResults[0];
    if (!caller || caller.standing !== "Command") {
      res.status(403).json({ error: "Command clearance required." });
      return;
    }
    if (req.params.id === callerId) {
      res.status(400).json({ error: "Cannot remove your own account." });
      return;
    }

    const targetResults = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id)).limit(1);
    if (targetResults[0]?.isFounder) {
      res.status(403).json({ error: "Cannot remove a founder account." });
      return;
    }

    const results = await db.delete(usersTable).where(eq(usersTable.id, req.params.id)).returning();
    if (!results[0]) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
