// Seeds the LOCAL D1 with one loginable account per role plus sample cars/payments/requirements,
// so `npm run dev` has data to log into and every dashboard renders content instead of empty states.
// Idempotent: fixed IDs + delete-then-insert, safe to re-run. Local only, never touches remote.
// Usage: node scripts/seed-dev.mjs
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "../app/lib/crypto.ts";

if (process.argv.includes("--remote")) {
  console.error("seed-dev is LOCAL ONLY. Refusing --remote — this inserts fake users and would corrupt production.");
  process.exit(1);
}

const PASSWORD = "devpass123";
const now = Math.floor(Date.now() / 1000); // seconds — schema uses integer({mode:"timestamp"}) = Math.floor(ms/1e3)
const day = 86400;

// Fixed IDs so re-running deletes exactly what it inserted (idempotent), rather than piling up rows.
const U = {
  superadmin: "00000000-0000-4000-8000-000000000001",
  finance: "00000000-0000-4000-8000-000000000002",
  client: "00000000-0000-4000-8000-000000000003",
  dealer: "00000000-0000-4000-8000-000000000004",
};
const CAR = {
  a: "00000000-0000-4000-8000-0000000000a1",
  b: "00000000-0000-4000-8000-0000000000a2",
  c: "00000000-0000-4000-8000-0000000000a3",
};
const PAY = ["b1", "b2", "b3", "b4", "b5", "b6"].map((s) => `00000000-0000-4000-8000-0000000000${s}`);
const REQ = ["c1", "c2"].map((s) => `00000000-0000-4000-8000-0000000000${s}`);

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

const hash = await hashPassword(PASSWORD); // one hash reused for all — same password, and each row is independent

const userRow = (id, email, name, role) =>
  `('${id}', '${sqlEscape(email)}', '${sqlEscape(name)}', '${role}', '${hash}', ${now})`;

const carRow = (id, dealerId, make, model, reg, offsetDays) =>
  `('${id}', '${U.client}', '${make}', '${model}', '${reg}', ${now - offsetDays * day}, ${
    dealerId ? `'${dealerId}'` : "NULL"
  }, ${now - offsetDays * day}, ${now + 335 * day}, ${now - offsetDays * day})`;

const payRow = (id, carId, amount, dueInDays, status, method, paid) =>
  `('${id}', '${carId}', ${amount}, ${now + dueInDays * day}, '${status}', ${
    method ? `'${method}'` : "NULL"
  }, ${paid ? now - day : "NULL"}, ${now})`;

const reqRow = (id, title, desc, color, qty, status) =>
  `('${id}', '${sqlEscape(title)}', '${sqlEscape(desc)}', '${color}', ${qty}, '${status}', ${now})`;

// Upsert rather than delete-then-insert: once you log in, sessions.user_id references these users,
// so deleting them fails on a foreign key. Upserting also leaves you logged in across a re-seed.
const sql = `
INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES
  ${userRow(U.superadmin, "superadmin@dev.local", "Dev Superadmin", "superadmin")},
  ${userRow(U.finance, "finance@dev.local", "Dev Finance", "finance")},
  ${userRow(U.client, "client@dev.local", "Dev Client", "client")},
  ${userRow(U.dealer, "dealer@dev.local", "Dev Dealer", "dealer")}
ON CONFLICT(id) DO UPDATE SET
  email = excluded.email, name = excluded.name, role = excluded.role, password_hash = excluded.password_hash;

INSERT INTO cars (id, client_id, make, model, registration_number, receipt_date, dealer_id, lease_start_date, lease_end_date, created_at) VALUES
  ${carRow(CAR.a, U.dealer, "Maruti", "Swift", "DEV-01-AA-0001", 30)},
  ${carRow(CAR.b, null, "Hyundai", "Creta", "DEV-01-BB-0002", 20)},
  ${carRow(CAR.c, null, "Tata", "Nexon", "DEV-01-CC-0003", 10)}
ON CONFLICT(id) DO UPDATE SET
  client_id = excluded.client_id, make = excluded.make, model = excluded.model,
  registration_number = excluded.registration_number, dealer_id = excluded.dealer_id;

INSERT INTO payments (id, car_id, amount, due_date, status, method, paid_at, created_at) VALUES
  ${payRow(PAY[0], CAR.a, 15000, -30, "green", "upi", true)},
  ${payRow(PAY[1], CAR.a, 15000, 0, "red", null, false)},
  ${payRow(PAY[2], CAR.b, 18000, -15, "green", "bank_transfer", true)},
  ${payRow(PAY[3], CAR.b, 18000, 15, "red", null, false)},
  ${payRow(PAY[4], CAR.c, 12000, -5, "green", "cash", true)},
  ${payRow(PAY[5], CAR.c, 12000, 25, "red", null, false)}
ON CONFLICT(id) DO UPDATE SET
  car_id = excluded.car_id, amount = excluded.amount, due_date = excluded.due_date,
  status = excluded.status, method = excluded.method, paid_at = excluded.paid_at;

INSERT INTO car_requirements (id, title, description, color, quantity, status, created_at) VALUES
  ${reqRow(REQ[0], "Need 5 sedans", "White, for corporate lease", "white", 5, "open")},
  ${reqRow(REQ[1], "SUV fleet", "Any color, urgent", "black", 3, "open")}
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title, description = excluded.description, color = excluded.color,
  quantity = excluded.quantity, status = excluded.status, closed_at = NULL;
`;

const sqlFile = join(tmpdir(), `seed-dev-${Date.now()}.sql`);
writeFileSync(sqlFile, sql);
try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "dp-tour-travels-db", "--local", "--file", sqlFile],
    { stdio: "inherit", shell: true },
  );
} finally {
  unlinkSync(sqlFile);
}

console.log(`\nSeeded 4 accounts (password: ${PASSWORD}):`);
console.log("  superadmin@dev.local  finance@dev.local  client@dev.local  dealer@dev.local\n");
