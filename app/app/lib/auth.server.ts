import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { users, sessions, type Role } from "../db/schema";
import { randomHex, hashPassword, generatePassword } from "./crypto";

export { verifyPassword, sha256Hex, hashPassword, generatePassword } from "./crypto";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const db = drizzle(env.DB);

function cookieHeader(value: string, maxAgeSeconds: number) {
  const secure = import.meta.env.PROD ? " Secure;" : "";
  return `${SESSION_COOKIE}=${value}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

export async function createSession(userId: string) {
  const id = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { cookie: cookieHeader(id, SESSION_TTL_MS / 1000) };
}

export async function destroySession(request: Request) {
  const id = readSessionCookie(request);
  if (id) await db.delete(sessions).where(eq(sessions.id, id));
  return { cookie: cookieHeader("", 0) };
}

function readSessionCookie(request: Request) {
  const header = request.headers.get("Cookie") ?? "";
  const match = header.match(/(?:^|;\s*)session=([^;]+)/);
  return match?.[1];
}

export async function getSessionUser(request: Request) {
  const sessionId = readSessionCookie(request);
  if (!sessionId) return null;

  const rows = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row.user;
}

export function dashboardPathForRole(role: Role) {
  return `/${role}`;
}

export async function requireUser(request: Request, allowedRoles?: Role[]) {
  const user = await getSessionUser(request);
  if (!user) throw redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    throw redirect(dashboardPathForRole(user.role as Role));
  }
  return user;
}

type StaffRole = "superadmin" | "finance";

export async function createStaffUser(
  input: { email: string; name: string; role: StaffRole },
): Promise<{ error: "missing/invalid field" | "already exists" } | { email: string; password: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !name || (input.role !== "superadmin" && input.role !== "finance")) {
    return { error: "missing/invalid field" as const };
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { error: "already exists" as const };
  }

  const password = generatePassword();
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    name,
    role: input.role,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  });

  return { email, password };
}
