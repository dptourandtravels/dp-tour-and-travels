// Bootstraps the first superadmin account, since account creation itself requires being logged in as one.
// Usage: node scripts/seed-superadmin.mjs <email> <name> [--remote]
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword, generatePassword } from "../app/lib/crypto.ts";

const [, , email, name, ...rest] = process.argv;
const remote = rest.includes("--remote");

if (!email || !name) {
  console.error("Usage: node scripts/seed-superadmin.mjs <email> <name> [--remote]");
  process.exit(1);
}

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

const password = generatePassword();
const id = crypto.randomUUID();
const passwordHash = await hashPassword(password);
const createdAt = Date.now();

const sql = `INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES ('${sqlEscape(
  id,
)}', '${sqlEscape(email.toLowerCase())}', '${sqlEscape(name)}', 'superadmin', '${sqlEscape(
  passwordHash,
)}', ${createdAt});`;

const sqlFile = join(tmpdir(), `seed-superadmin-${Date.now()}.sql`);
writeFileSync(sqlFile, sql);
try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "dp-tour-travels-db", remote ? "--remote" : "--local", "--file", sqlFile],
    { stdio: "inherit", shell: true },
  );
} finally {
  unlinkSync(sqlFile);
}

console.log(`\nSuperadmin created: ${email} / ${password}\n(Save this password now — it is not stored anywhere.)`);
