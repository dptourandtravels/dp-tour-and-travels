import { data, Form, redirect } from "react-router";
import type { Route } from "./+types/login";
import { findUserByEmail, verifyPassword, createSession, getSessionUser, dashboardPathForRole } from "../lib/auth.server";
import { type Role } from "../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser(request);
  if (user) throw redirect(dashboardPathForRole(user.role as Role));
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return data({ error: "Invalid email or password." }, { status: 401 });
  }

  const { cookie } = await createSession(user.id);
  return redirect(dashboardPathForRole(user.role as Role), {
    headers: { "Set-Cookie": cookie },
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <main className="max-w-sm mx-auto pt-24 px-4">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <Form method="post" className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="border rounded px-3 py-2" />
        {actionData?.error && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Sign in
        </button>
      </Form>
      <a href="/forgot-password" className="block text-sm mt-4 underline">
        Forgot password?
      </a>
    </main>
  );
}
