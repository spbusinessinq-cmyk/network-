import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/messages
router.get("/", requireAuth, async (_req, res) => {
  try {
    const msgs = await db.select().from(messagesTable).orderBy(messagesTable.createdAt);
    res.json(msgs.map(m => ({
      id: m.id,
      userId: m.userId,
      text: m.message,
      timestamp: m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      responses: m.responses,
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/messages
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { text, responses } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "Message text required" }); return; }

    const [newMsg] = await db.insert(messagesTable).values({
      userId,
      message: text.trim(),
      responses: responses || [],
    }).returning();

    res.status(201).json({
      id: newMsg.id,
      userId: newMsg.userId,
      text: newMsg.message,
      timestamp: newMsg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      responses: newMsg.responses,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/messages/:id/response
router.patch("/:id/response", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { response } = req.body;
    if (!response) { res.status(400).json({ error: "Response required" }); return; }

    await db.update(messagesTable)
      .set({ responses: sql`array_append(responses, ${response})` })
      .where(eq(messagesTable.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
