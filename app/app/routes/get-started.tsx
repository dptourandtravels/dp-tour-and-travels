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
    <div className="min-h-screen flex bg-surface">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary text-white flex-col justify-between p-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-secondary to-yellow-400 shrink-0"></div>
          <span className="font-headline-md text-headline-md font-bold tracking-tight">DP Tour &amp; Travels</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display-lg text-4xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Where your car finds{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-fixed to-yellow-300">
              purpose.
            </span>
          </h1>
          <p className="font-body-lg text-lg text-primary-fixed/70 leading-relaxed">
            Create your account to book a slot, track your payouts, and manage your agreement — all from one
            dashboard.
          </p>
        </div>

        <p className="relative z-10 font-body-md text-sm text-primary-fixed/50">
          © {new Date().getFullYear()} DP Tour and Travels
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-12 w-fit">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-secondary to-yellow-400 shrink-0"></div>
            <span className="font-headline-md text-lg font-bold text-primary tracking-tight">DP Tour &amp; Travels</span>
          </Link>

          <h2 className="font-headline-md text-3xl font-bold text-primary tracking-tight mb-2">Create your account</h2>
          <p className="font-body-md text-on-surface-variant mb-10">Get started in less than a minute.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface-variant">Full name</span>
              <input
                name="name"
                type="text"
                placeholder="Jane Doe"
                required
                className="rounded-xl border border-outline-variant bg-white px-4 py-3 font-body-md text-body-md text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface-variant">Email</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="rounded-xl border border-outline-variant bg-white px-4 py-3 font-body-md text-body-md text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-label-md text-label-md text-on-surface-variant">Password</span>
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="rounded-xl border border-outline-variant bg-white px-4 py-3 font-body-md text-body-md text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-xl bg-primary text-white py-3.5 font-label-md text-label-md font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              Create account
            </button>
          </form>

          {popup && (
            <DemoPopup
              ok
              title="Signup is working"
              message={`Thanks, ${popup.name}! Your account request has been received.`}
              onClose={() => setPopup(null)}
            />
          )}

          <p className="mt-6 font-label-md text-label-md text-on-surface-variant">
            Already have an account?{" "}
            <Link to="#" className="text-secondary font-semibold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>

          <p className="mt-4 font-label-md text-label-sm text-on-surface-variant/70">
            Want to become a dealer instead?{" "}
            <Link to="/dealers/apply" className="text-primary font-semibold hover:underline underline-offset-4">
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
