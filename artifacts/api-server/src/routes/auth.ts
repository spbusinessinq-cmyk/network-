import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { signToken } from "../lib/auth.js";

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

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    const results = await db
      .select()
      .from(usersTable)
      .where(ilike(usersTable.username, username))
      .limit(1);

    const user = results[0];
    if (!user) {
      res.status(401).json({ error: "ACCESS DENIED. Credentials not recognized." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "ACCESS DENIED. Credentials not recognized." });
      return;
    }

    const userStatus = (user as any).status || "active";
    if (userStatus === "banned") {
      res.status(403).json({ error: "NETWORK ACCESS REVOKED. Contact Command to appeal." });
      return;
    }

    const token = signToken({ userId: user.id, isFounder: user.isFounder });
    res.json({ token, user: toFrontendUser(user) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { alias, bio, cardStyle } = req.body;
    if (!alias?.trim()) {
      res.status(400).json({ error: "Alias is required" });
      return;
    }

    const username = alias.toLowerCase().replace(/\s+/g, "");
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken. Choose a different alias." });
      return;
    }

    const rsrId = `RSR-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const passwordHash = await bcrypt.hash(rsrId, 10);

    const newUser = {
      id: rsrId,
      username,
      passwordHash,
      alias: alias.trim(),
      bio: bio?.trim() || "Awaiting classification.",
      statusLine: "Awaiting assignment.",
      rsrId,
      role: "Observer",
      standing: "Observer",
      grade: "I",
      cardStyle: cardStyle || "steel",
      accessClass: "STANDARD",
      credentialMeaning: "Entry-level network credential.",
      presence: "Online",
      joinDate: new Date().toISOString().split("T")[0],
      contributionCount: 0,
      promotionStatus: "Not Eligible",
      reviewStatus: "Pending",
      isFounder: false,
    };

    await db.insert(usersTable).values(newUser as any);
    const token = signToken({ userId: rsrId, isFounder: false });
    res.status(201).json({ token, user: toFrontendUser(newUser as any) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/verify
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) { res.status(400).json({ error: "Token required" }); return; }

    const { verifyToken } = await import("../lib/auth.js");
    const payload = verifyToken(token);
    if (!payload) { res.status(401).json({ error: "Invalid token" }); return; }

    const results = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    const user = results[0];
    if (!user) { res.status(401).json({ error: "User not found" }); return; }

    const userStatus = (user as any).status || "active";
    if (userStatus === "banned") {
      res.status(403).json({ error: "NETWORK ACCESS REVOKED." });
      return;
    }

    res.json({ user: toFrontendUser(user) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
