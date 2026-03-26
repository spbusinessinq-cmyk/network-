import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, signalsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/cases
router.get("/", requireAuth, async (_req, res) => {
  try {
    const cases = await db.select().from(casesTable).orderBy(desc(casesTable.createdAt));

    const result = await Promise.all(cases.map(async (c) => {
      const linkedSignals = await db.select({ id: signalsTable.id }).from(signalsTable).where(eq(signalsTable.caseId, c.id));
      return {
        id: c.id,
        name: c.name,
        summary: c.summary,
        status: c.status,
        lead: c.lead,
        notes: c.notes,
        linkedSignals: linkedSignals.map(s => s.id),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    }));

    res.json(result);
  } catch (err) {
    console.error("Cases fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/cases
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, summary, status, lead, notes } = req.body;
    if (!name?.trim()) { res.status(400).json({ error: "Case name required" }); return; }

    const [newCase] = await db.insert(casesTable).values({
      name: name.trim(),
      summary: summary?.trim() || "",
      status: status || "OPEN",
      lead: lead || (req as any).user.userId,
      notes: notes || [],
    }).returning();

    res.status(201).json({
      id: newCase.id,
      name: newCase.name,
      summary: newCase.summary,
      status: newCase.status,
      lead: newCase.lead,
      notes: newCase.notes,
      linkedSignals: [],
      createdAt: newCase.createdAt.toISOString(),
      updatedAt: newCase.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("Case create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/cases/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes, summary } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (summary !== undefined) updates.summary = summary;

    await db.update(casesTable).set(updates).where(eq(casesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
