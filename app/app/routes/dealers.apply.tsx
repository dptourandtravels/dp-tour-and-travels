import { data, Form, Link } from "react-router";
import type { Route } from "./+types/dealers.apply";
import { submitDealerApplication } from "../lib/dealer-applications.server";

export function meta() {
  return [{ title: "Apply for Dealer Access — DP Tour and Travels" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const message = String(form.get("message") ?? "");

  if (!name || !email || !phone) {
    return data({ error: "Name, email, and phone are required." }, { status: 400 });
  }

  await submitDealerApplication({ name, email, phone, message });
  return data({ submitted: true as const });
}

function Nav() {
  return (
    <div className="sticky top-0 z-50 w-full bg-[rgba(245,245,247,0.8)] backdrop-blur-xl border-b border-black/[0.08]">
      <div className="max-w-[1440px] mx-auto h-[52px] flex items-center justify-between px-6 md:px-8">
        <Link to="/" className="text-tagline text-ink">DP Tour &amp; Travels</Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/#owners" className="text-ink text-sm tracking-tight hover:text-action transition-colors">For owners</Link>
          <Link to="/#dealers" className="text-ink text-sm tracking-tight hover:text-action transition-colors">For dealers</Link>
          <Link to="/login" className="text-ink text-sm tracking-tight hover:text-action transition-colors">Login</Link>
          <a href="#apply" className="bg-action text-white text-sm rounded-full px-[18px] py-2.5 hover:bg-action-focus active:scale-95 transition-all">
            Apply now
          </a>
        </nav>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-canvas-parchment">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <span className="text-tagline text-ink">DP Tour &amp; Travels</span>
          <p className="text-xs text-ink-muted-48 mt-3 max-w-[260px]">Precision in logistics, care in every journey.</p>
        </div>
        <div>
          <p className="text-label-sm text-ink mb-1">Company</p>
          <div className="flex flex-col">
            <Link to="/#owners" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">About us</Link>
            <Link to="/#terms" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Why choose us</Link>
            <a href="#" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Contact us</a>
          </div>
        </div>
        <div>
          <p className="text-label-sm text-ink mb-1">Portals</p>
          <div className="flex flex-col">
            <Link to="/login" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Client Login</Link>
            <Link to="/login" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Dealer Login</Link>
          </div>
        </div>
        <div>
          <p className="text-label-sm text-ink mb-1">Legal</p>
          <div className="flex flex-col">
            <a href="#" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Privacy Policy</a>
            <Link to="/terms" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-5">
          <p className="text-xs text-ink-muted-48">© {new Date().getFullYear()} DP Tour and Travels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function DealersApply({ actionData }: Route.ComponentProps) {
  if (actionData && "submitted" in actionData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Nav />
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-24">
          <h1 className="text-tile-heading text-ink">Application received.</h1>
          <p className="text-body-apple text-ink-muted-80 mt-4 max-w-md">
            Thanks for applying — our team will review your application and get in touch.
          </p>
          <Link to="/" className="text-action text-body-apple font-semibold mt-8">
            Back to home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav />

      <section className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 pt-24 pb-16 flex flex-col items-center text-center">
          <span className="text-action text-sm font-semibold uppercase tracking-wide mb-5">Become a Dealer</span>
          <h1 className="text-hero-display text-ink max-w-2xl">Run the fleet. We'll handle the rest.</h1>
          <p className="text-lead text-ink max-w-xl mt-6">
            Access brand-new vehicles, fully backed by agreements and support — see if you qualify below.
          </p>
        </div>
      </section>

      <section className="w-full bg-tile-1">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-tagline text-link-on-dark">Before you apply</span>
            <h2 className="text-tile-heading text-white mt-4">Eligibility requirements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="bg-[#333335] rounded-[18px] p-6">
              <p className="text-body-apple text-white">Hold a valid dealer/trade license for vehicle rental or resale</p>
            </div>
            <div className="bg-[#333335] rounded-[18px] p-6">
              <p className="text-body-apple text-white">Have a registered business address we can verify</p>
            </div>
            <div className="bg-[#333335] rounded-[18px] p-6">
              <p className="text-body-apple text-white">Be able to take on at least one leased vehicle within 30 days of approval</p>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="w-full bg-canvas-parchment">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 flex flex-col items-center">
          <h2 className="text-tile-heading text-ink mb-10">Tell us about your business</h2>
          <div className="bg-white border border-hairline rounded-[18px] p-10 w-full max-w-md">
            <Form method="post" className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink">Your name</span>
                <input
                  name="name"
                  placeholder="Your name"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink">Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  required
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-label-sm text-ink">Tell us about your business (optional)</span>
                <textarea
                  name="message"
                  placeholder="Fleet size, region, experience…"
                  rows={4}
                  className="text-body-apple text-ink border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all resize-none"
                />
              </label>
              {actionData && "error" in actionData && (
                <p className="text-sm text-red-600">{actionData.error}</p>
              )}
              <button
                type="submit"
                className="bg-action text-white text-body-apple rounded-full px-[22px] py-[13px] mt-2 hover:bg-action-focus active:scale-95 transition-all"
              >
                Submit application
              </button>
            </Form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
