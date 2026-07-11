import { env } from "cloudflare:workers";
import { data, Form } from "react-router";
import type { Route } from "./+types/forgot-password";
import { db, findUserByEmail, sha256Hex } from "../lib/auth.server";
import { passwordResetTokens } from "../db/schema";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();

  const user = await findUserByEmail(email);
  if (user) {
    const token = crypto.randomUUID() + crypto.randomUUID();
    await db.insert(passwordResetTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: await sha256Hex(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const resetUrl = new URL(`/reset-password/${token}`, request.url).toString();
    try {
      // TODO: Email Sending requires Workers Paid plan + a verified sending domain
      // (see the note under Phase 1 in plan.md). Until then this throws E_SENDER_NOT_VERIFIED.
      await env.EMAIL.send({
        to: user.email,
        from: { email: "no-reply@dptourandtravels.com", name: "DP Tour and Travels" },
        subject: "Reset your password",
        html: `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
        text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
      });
    } catch (error) {
      console.error("Password reset email not sent:", error);
    }
  }

  // Always the same response, whether or not the email exists — avoids leaking which emails are registered.
  return data({ submitted: true });
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  if (actionData?.submitted) {
    return (
      <main className="max-w-sm mx-auto pt-24 px-4">
        <p>If that email is registered, a reset link has been sent.</p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto pt-24 px-4">
      <h1 className="text-2xl font-semibold mb-6">Forgot password</h1>
      <Form method="post" className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Send reset link
        </button>
      </Form>
    </main>
  );
}
