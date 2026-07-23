import { useState, type FormEvent } from "react";
import { data, Link, redirect } from "react-router";
import type { Route } from "./+types/get-started";
import { createSession, getSessionUser, signUpClient, dashboardPathForRole } from "../lib/auth.server";
import { type Role } from "../db/schema";
import { DemoPopup } from "../components/demo-popup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Get Started — DP Tour & Travels" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser(request);
  if (user) throw redirect(dashboardPathForRole(user.role as Role));
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (password.length < 8) {
    return data({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await signUpClient({ name, email, password });
  if ("error" in result) {
    const message =
      result.error === "already exists"
        ? "An account with that email already exists — try signing in instead."
        : "Enter your name, email, and a password of at least 8 characters.";
    return data({ error: message }, { status: 400 });
  }

  const { cookie } = await createSession(result.user.id);
  return redirect("/client", { headers: { "Set-Cookie": cookie } });
}

export default function GetStarted(_: Route.ComponentProps) {
  const [popup, setPopup] = useState<{ name: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    setPopup({ name });
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
          <Link to="/login" className="text-ink text-sm tracking-tight hover:text-action transition-colors">
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-tile-heading text-ink mb-3">Create your account</h1>
            <p className="text-body-apple text-ink-muted-80">
              Get started in less than a minute.
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-[18px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink font-medium">Full name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Ankush"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink font-medium">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@gmail.com"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink font-medium">Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>

              <button
                type="submit"
                className="mt-4 bg-action text-white text-body-apple font-medium rounded-full px-4 py-[13px] hover:bg-action-focus active:scale-95 transition-all w-full"
              >
                Create account
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-hairline text-center">
              <p className="text-sm text-ink-muted-80 mb-2">
                Already have an account?{" "}
                <Link to="/login" className="text-action font-semibold hover:underline underline-offset-4 transition-all">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-ink-muted-48">
                Want to become a dealer instead?{" "}
                <Link to="/dealers/apply" className="text-action font-semibold hover:underline underline-offset-4 transition-all">
                  Apply here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {popup && (
          <DemoPopup
            ok
            title="Signup is working"
            message={`Thanks, ${popup.name}! Your account request has been received.`}
            onClose={() => setPopup(null)}
          />
        )}
      </div>
    </div>
  );
}
