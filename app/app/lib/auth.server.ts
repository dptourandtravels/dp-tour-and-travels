import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { users, sessions, type Role } from "../db/schema";
import { randomHex, hashPassword, verifyPassword, generatePassword } from "./crypto";
import { dashboardPathForRole } from "./roles";

export { verifyPassword, sha256Hex, hashPassword, generatePassword } from "./crypto";
export { dashboardPathForRole } from "./roles";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const db = drizzle(env.DB);

export const publicUserColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  profilePictureR2Key: users.profilePictureR2Key,
  createdAt: users.createdAt,
} as const;

function toPublicUser<T extends { passwordHash: string }>(user: T): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

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
    .select({ user: publicUserColumns, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row.user;
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

async function insertUser(email: string, name: string, role: Role) {
  const password = generatePassword();
  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    role,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  };
  await db.insert(users).values(user);
  return { user, password };
}

export async function createStaffUser(
  input: { email: string; name: string; role: StaffRole },
): Promise<{ error: "missing/invalid field" | "already exists" } | { email: string; password: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !name || (input.role !== "superadmin" && input.role !== "finance")) {
    return { error: "missing/invalid field" as const };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "already exists" as const };
  }

  const { password } = await insertUser(email, name, input.role);
  return { email, password };
}

export async function listUsersByRole(role: Role) {
  return db.select(publicUserColumns).from(users).where(eq(users.role, role));
}

export async function updateUserRole(userId: string, role: Role) {
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getOrCreateClient(email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) return { user: toPublicUser(existing), password: null };

  const { user, password } = await insertUser(normalizedEmail, name.trim(), "client");
  return { user: toPublicUser(user), password };
}

export async function updateUserProfile(userId: string, input: { name: string; email: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name) return { error: "missing/invalid field" as const };

  const existing = await findUserByEmail(email);
  if (existing && existing.id !== userId) return { error: "already exists" as const };

  await db.update(users).set({ name, email }).where(eq(users.id, userId));
  return { success: true as const };
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." as const };

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { error: "Current password is incorrect." as const };
  }

  await db.update(users).set({ passwordHash: await hashPassword(newPassword) }).where(eq(users.id, userId));
  return { success: true as const };
}

export async function uploadProfilePicture(userId: string, file: File) {
  const key = `profile-pictures/${userId}`;
  await env.DOCUMENTS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  await db.update(users).set({ profilePictureR2Key: key }).where(eq(users.id, userId));
}

export async function getProfilePicture(r2Key: string) {
  return env.DOCUMENTS.get(r2Key);
}

// Public self-signup. Creates a role-less "user" account; a superadmin assigns the real role later.
// (Staff-onboarded clients are created as "client" via getOrCreateClient, not here.)
export async function signUpUser(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!email || !name || password.length < 8) {
    return { error: "missing/invalid field" as const };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "already exists" as const };
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    name,
    role: "user" as const,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  };
  await db.insert(users).values(user);
  return { user };
}
