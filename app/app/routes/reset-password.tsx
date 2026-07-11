import { data, Form, redirect } from "react-router";
import { and, eq, isNull } from "drizzle-orm";
import type { Route } from "./+types/reset-password";
import { db, sha256Hex, hashPassword } from "../lib/auth.server";
import { passwordResetTokens, sessions, users } from "../db/schema";

async function findValidToken(token: string) {
  const tokenHash = await sha256Hex(token);
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
    .limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export async function loader({ params }: Route.LoaderArgs) {
  const valid = await findValidToken(params.token);
  return { valid: Boolean(valid) };
}

export async function action({ request, params }: Route.ActionArgs) {
  const tokenRow = await findValidToken(params.token);
  if (!tokenRow) {
    return data({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (password.length < 8) {
    return data({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, tokenRow.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, tokenRow.id));
  await db.delete(sessions).where(eq(sessions.userId, tokenRow.userId));

  throw redirect("/login");
}

export default function ResetPassword({ loaderData, actionData }: Route.ComponentProps) {
  if (!loaderData.valid) {
    return (
      <main className="max-w-sm mx-auto pt-24 px-4">
        <p>This reset link is invalid or has expired.</p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto pt-24 px-4">
      <h1 className="text-2xl font-semibold mb-6">Set a new password</h1>
      <Form method="post" className="flex flex-col gap-4">
        <input
          name="password"
          type="password"
          placeholder="New password"
          minLength={8}
          required
          className="border rounded px-3 py-2"
        />
        {actionData?.error && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Reset password
        </button>
      </Form>
    </main>
  );
}
