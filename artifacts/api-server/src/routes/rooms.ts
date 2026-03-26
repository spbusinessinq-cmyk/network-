import { Router } from "express";
import { db, roomsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    const rooms = await db.select().from(roomsTable).orderBy(roomsTable.createdAt);
    res.json(rooms);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, slug } = req.body;
    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ error: "Name and slug required" });
      return;
    }
    const [room] = await db.insert(roomsTable).values({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      type: "custom",
      createdBy: user.userId,
    }).returning();
    res.status(201).json(room);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    if (room.type === "system") { res.status(403).json({ error: "Cannot delete system rooms" }); return; }
    await db.delete(roomsTable).where(eq(roomsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
