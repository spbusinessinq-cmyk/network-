import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding RSR Network database...");

    const users = [
      {
        id: "RSR-000001",
        username: "EIO",
        password: "4451",
        alias: "Black Rail",
        bio: "Network founder. Command authority.",
        status_line: "Network oversight active.",
        rsr_id: "RSR-000001",
        role: "Founder",
        standing: "Command",
        grade: null,
        card_style: "gold",
        access_class: "ELEVATED",
        credential_meaning: "Restricted command credential. Founder-class authority.",
        presence: "COMMAND ACTIVE",
        join_date: "2025-11-01",
        contribution_count: 47,
        promotion_status: "Command Reserved",
        review_status: "Command Assigned",
        is_founder: true,
      },
      {
        id: "RSR-000103",
        username: "echo",
        password: "echo",
        alias: "Signal Echo",
        bio: "Signal verification and pattern analysis.",
        status_line: "Pattern analysis in progress.",
        rsr_id: "RSR-000103",
        role: "Analyst",
        standing: "Analyst",
        grade: "II",
        card_style: "obsidian",
        access_class: "FIELD",
        credential_meaning: "Verification and intelligence review credential.",
        presence: "Reviewing Signals",
        join_date: "2026-01-08",
        contribution_count: 31,
        promotion_status: "Under Review",
        review_status: "Active",
        is_founder: false,
      },
      {
        id: "RSR-000214",
        username: "vanta",
        password: "vanta",
        alias: "Operator Vanta",
        bio: "Field observation and signal intake.",
        status_line: "Field observation active.",
        rsr_id: "RSR-000214",
        role: "Scout",
        standing: "Scout",
        grade: "I",
        card_style: "steel",
        access_class: "STANDARD",
        credential_meaning: "Structured support and field-aligned credential.",
        presence: "Online",
        join_date: "2026-03-10",
        contribution_count: 12,
        promotion_status: "Eligible",
        review_status: "Pending",
        is_founder: false,
      },
      {
        id: "RSR-000089",
        username: "cipher",
        password: "cipher",
        alias: "Cipher Nine",
        bio: "Infrastructure and logistics surveillance.",
        status_line: "Infrastructure surveillance ongoing.",
        rsr_id: "RSR-000089",
        role: "Operator",
        standing: "Operator",
        grade: "III",
        card_style: "graphite",
        access_class: "FIELD",
        credential_meaning: "Low-signature operational credential.",
        presence: "In Case Room",
        join_date: "2026-01-22",
        contribution_count: 24,
        promotion_status: "Not Eligible",
        review_status: "Active",
        is_founder: false,
      },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await client.query(
        `INSERT INTO users (id, username, password_hash, alias, bio, status_line, rsr_id, role, standing, grade, card_style, access_class, credential_meaning, presence, join_date, contribution_count, promotion_status, review_status, is_founder)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           alias = EXCLUDED.alias,
           bio = EXCLUDED.bio,
           status_line = EXCLUDED.status_line,
           role = EXCLUDED.role,
           standing = EXCLUDED.standing,
           grade = EXCLUDED.grade,
           card_style = EXCLUDED.card_style,
           access_class = EXCLUDED.access_class,
           credential_meaning = EXCLUDED.credential_meaning,
           presence = EXCLUDED.presence,
           contribution_count = EXCLUDED.contribution_count,
           promotion_status = EXCLUDED.promotion_status,
           review_status = EXCLUDED.review_status,
           is_founder = EXCLUDED.is_founder`,
        [u.id, u.username, hash, u.alias, u.bio, u.status_line, u.rsr_id, u.role, u.standing, u.grade, u.card_style, u.access_class, u.credential_meaning, u.presence, u.join_date, u.contribution_count, u.promotion_status, u.review_status, u.is_founder]
      );
      console.log(`  ✓ User: ${u.alias}`);
    }

    // Seed signals (skip if already exist)
    const sigCheck = await client.query("SELECT COUNT(*) FROM signals");
    if (parseInt(sigCheck.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO signals (title, description, category, location, status, priority, submitted_by, case_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        ["Procurement anomaly flagged at downtown contract node", "Source points to linked vendor activity and timing overlap with public works revisions. High probability of systemic manipulation.", "Political", "Los Angeles", "VERIFIED", true, "RSR-000214", 1]
      );
      await client.query(
        `INSERT INTO signals (title, description, category, location, status, priority, submitted_by, case_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        ["Permit cluster activity near federal corridor", "Permit clustering suggests coordinated street action window later this week. Monitoring organizer channels for confirmation.", "Local", "Wilshire Corridor", "VERIFIED", false, "RSR-000103", 2]
      );
      await client.query(
        `INSERT INTO signals (title, description, category, location, status, priority, submitted_by, case_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        ["Logistics slowdown signal — port disruption pattern", "Several shipping inputs indicate soft disruption and delayed fulfillment pathing. May be early indicator of labor action.", "Economic", "Port Node", "UNVERIFIED", false, "RSR-000089", null]
      );
      console.log("  ✓ Signals seeded");
    } else {
      console.log("  ↷ Signals already seeded");
    }

    // Seed cases (skip if already exist)
    const caseCheck = await client.query("SELECT COUNT(*) FROM cases");
    if (parseInt(caseCheck.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO cases (name, summary, status, lead, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        ["LA Infrastructure Watch", "Urban contract irregularities, ownership mapping, and incident clustering.", "ACTIVE", "RSR-000001", ["Money flow mapping in progress.", "FOIA targets identified."]]
      );
      await client.query(
        `INSERT INTO cases (name, summary, status, lead, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        ["Federal Corridor Monitoring", "Permit activity, coordination indicators, and escalation tracking.", "MONITORING", "RSR-000103", ["Monitor permit updates.", "Track organizer pattern shifts."]]
      );
      console.log("  ✓ Cases seeded");
    } else {
      console.log("  ↷ Cases already seeded");
    }

    // Seed network messages (skip if already exist)
    const msgCheck = await client.query("SELECT COUNT(*) FROM network_messages");
    if (parseInt(msgCheck.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO network_messages (user_id, message, responses) VALUES ($1,$2,$3)`,
        ["RSR-000001", "Network operational. Stand by for inbound signals.", ["ACKNOWLEDGED"]]
      );
      await client.query(
        `INSERT INTO network_messages (user_id, message, responses) VALUES ($1,$2,$3)`,
        ["RSR-000214", "Vanta online. Moving to observation point.", ["LOGGED"]]
      );
      await client.query(
        `INSERT INTO network_messages (user_id, message, responses) VALUES ($1,$2,$3)`,
        ["RSR-000103", "Verifying overnight stream. High noise ratio.", ["TRACKING"]]
      );
      console.log("  ✓ Network messages seeded");
    } else {
      console.log("  ↷ Messages already seeded");
    }

    console.log("\nSeed complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });
