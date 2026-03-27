import { Router } from "express";
import { db, roomsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
import { eq } from "drizzle-orm";
import { takeFirstInt } from "../lib/params.js";

const router = Router();

async function requireCommand(req: any, res: any): Promise<boolean> {
  const callerId = req.user?.id || req.user?.userId;
  if (!callerId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, callerId));
  if (!caller || caller.standing !== "Command") {
    res.status(403).json({ error: "Command clearance required." });
    return false;
  }
  return true;
}

// GET /api/rooms
router.get("/", requireAuth, async (_req, res) => {
  try {
    const rooms = await db.select().from(roomsTable).orderBy(roomsTable.createdAt);
    res.json(rooms);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/rooms — Command only
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!await requireCommand(req, res)) return;
    const { name, slug } = req.body;
    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ error: "Name and slug required" });
      return;
    }
    const [room] = await db.insert(roomsTable).values({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      type: "custom",
      createdBy: (req as any).user?.userId || (req as any).user?.id,
    }).returning();
    res.status(201).json(room);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/rooms/:id — Command only, cannot rename system rooms
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    if (!await requireCommand(req, res)) return;
    const id = takeFirstInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid room id" }); return; }
    const { name } = req.body;
    if (!name?.trim()) { res.status(400).json({ error: "Name required" }); return; }
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    if (room.type === "system") { res.status(403).json({ error: "Cannot rename system rooms." }); return; }
    const [updated] = await db.update(roomsTable)
      .set({ name: name.trim() })
      .where(eq(roomsTable.id, id))
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/rooms/:id — Command only, cannot delete system rooms
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!await requireCommand(req, res)) return;
    const id = takeFirstInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid room id" }); return; }
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    if (room.type === "system") { res.status(403).json({ error: "Cannot delete system rooms." }); return; }
    await db.delete(roomsTable).where(eq(roomsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
