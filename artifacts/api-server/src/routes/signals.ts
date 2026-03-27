import { Router } from "express";
import { db } from "@workspace/db";
import { signalsTable, signalThreadsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { takeFirstInt } from "../lib/params.js";

const router = Router();

// GET /api/signals
router.get("/", requireAuth, async (_req, res) => {
  try {
    const signals = await db.select().from(signalsTable).orderBy(desc(signalsTable.createdAt));

    const result = await Promise.all(signals.map(async (s) => {
      const threads = await db.select().from(signalThreadsTable).where(eq(signalThreadsTable.signalId, s.id)).orderBy(signalThreadsTable.createdAt);
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        location: s.location,
        status: s.status,
        priority: s.priority,
        submittedBy: s.submittedBy,
        caseId: s.caseId,
        timestamp: s.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: s.createdAt.toISOString(),
        thread: threads.map(t => ({
          id: t.id,
          userId: t.userId,
          text: t.message,
          timestamp: t.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),
      };
    }));

    res.json(result);
  } catch (err) {
    console.error("Signals fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/signals
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, category, location, status, priority, caseId } = req.body;
    const userId = (req as any).user.userId;

    if (!title?.trim()) { res.status(400).json({ error: "Title required" }); return; }

    const [newSignal] = await db.insert(signalsTable).values({
      title: title.trim(),
      description: description?.trim() || "",
      category: category || "General",
      location: location?.trim() || "",
      status: status || "UNVERIFIED",
      priority: !!priority,
      submittedBy: userId,
      caseId: caseId || null,
    }).returning();

    res.status(201).json({
      id: newSignal.id,
      title: newSignal.title,
      description: newSignal.description,
      category: newSignal.category,
      location: newSignal.location,
      status: newSignal.status,
      priority: newSignal.priority,
      submittedBy: newSignal.submittedBy,
      caseId: newSignal.caseId,
      timestamp: newSignal.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: newSignal.createdAt.toISOString(),
      thread: [],
    });
  } catch (err) {
    console.error("Signal create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/signals/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = takeFirstInt(req.params.id);
    const { status, priority, caseId } = req.body;
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (caseId !== undefined) updates.caseId = caseId;

    await db.update(signalsTable).set(updates).where(eq(signalsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/signals/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = takeFirstInt(req.params.id);
    await db.delete(signalThreadsTable).where(eq(signalThreadsTable.signalId, id));
    await db.delete(signalsTable).where(eq(signalsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/signals/:id/thread
router.post("/:id/thread", requireAuth, async (req, res) => {
  try {
    const signalId = takeFirstInt(req.params.id);
    const userId = (req as any).user.userId;
    const { message } = req.body;

    if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

    const [newMsg] = await db.insert(signalThreadsTable).values({
      signalId,
      userId,
      message: message.trim(),
    }).returning();

    res.status(201).json({
      id: newMsg.id,
      userId: newMsg.userId,
      text: newMsg.message,
      timestamp: newMsg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
