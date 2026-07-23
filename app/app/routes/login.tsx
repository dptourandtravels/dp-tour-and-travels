import { useState, type FormEvent } from "react";
import { data, Link, redirect } from "react-router";
import type { Route } from "./+types/login";
import { findUserByEmail, verifyPassword, createSession, getSessionUser, dashboardPathForRole } from "../lib/auth.server";
import { type Role } from "../db/schema";
import { DemoPopup } from "../components/demo-popup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In — DP Tour & Travels" }];
}

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

export default function Login(_: Route.ComponentProps) {
  const [popup, setPopup] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (email === "admin" && password === "admin") {
      setPopup({ ok: true, message: "You're signed in as admin." });
    } else {
      setPopup({ ok: false, message: "Invalid credentials — try admin / admin." });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas-parchment font-sans">
      {/* Simple Minimal Nav */}
      <div className="w-full bg-[rgba(245,245,247,0.8)] backdrop-blur-xl border-b border-black/[0.08] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto h-[52px] flex items-center justify-between px-6 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-ink">
            <img src="/dp-logo-mark.png" alt="" className="w-7 h-7 object-contain shrink-0" />
            <span className="text-tagline whitespace-nowrap">DP Tour &amp; Travels</span>
          </Link>
          <Link to="/get-started" className="text-ink text-sm tracking-tight hover:text-action transition-colors">
            Create an account
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-tile-heading text-ink mb-3">Welcome back</h1>
            <p className="text-body-apple text-ink-muted-80">
              Sign in to your account to continue.
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-[18px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink font-medium">Email</span>
                <input
                  name="email"
                  type="text"
                  placeholder="admin"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink font-medium">Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder="admin"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>

              <button
                type="submit"
                className="mt-4 bg-action text-white text-body-apple font-medium rounded-full px-4 py-[13px] hover:bg-action-focus active:scale-95 transition-all w-full"
              >
                Sign in
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-hairline">
              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-ink-muted-80 hover:text-action transition-colors"
                >
                  Forgot password?
                </Link>
                <Link
                  to="/get-started"
                  className="text-sm text-action font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {popup && (
          <DemoPopup
            ok={popup.ok}
            title={popup.ok ? "Sign in is working" : "Sign in failed"}
            message={popup.message}
            onClose={() => setPopup(null)}
          />
        )}
      </div>
    </div>
  );
}
