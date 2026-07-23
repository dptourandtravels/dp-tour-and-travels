import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { listOpenCarRequirements } from "../lib/requirements.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DP Tour & Travels" },
    { name: "description", content: "Hand over your car for a 5-year lease. We handle the rest." },
  ];
}

export async function loader() {
  const requirements = await listOpenCarRequirements();
  return { requirements };
}

const stripe = (a: string, b: string) =>
  `repeating-linear-gradient(135deg, ${a}, ${a} 10px, ${b} 10px, ${b} 20px)`;

const terms = [
  "A slot must be pre-booked before delivery",
  "Only brand-new cars are accepted",
  "5-year insurance provided by the owner",
  "Only white-plate (private) cars are accepted",
  "GPS devices are strictly prohibited",
  "The car must be handed over voluntarily",
  "No installment may be missed during the 5-year term",
  "Under 1,500–2,000 km on the odometer",
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { requirements } = loaderData;
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav — frosted navigation bar */}
      <div className="sticky top-0 z-50 w-full bg-[rgba(245,245,247,0.8)] backdrop-blur-xl border-b border-black/[0.08]">
        <div className="max-w-[1440px] mx-auto h-[52px] flex items-center justify-between px-6 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-ink">
            <img src="/dp-logo-mark.png" alt="" className="w-7 h-7 object-contain shrink-0" />
            <span className="text-tagline whitespace-nowrap">DP Tour &amp; Travels</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#owners" className="text-ink text-sm tracking-tight hover:text-action transition-colors">For owners</a>
            <a href="#dealers" className="text-ink text-sm tracking-tight hover:text-action transition-colors">For dealers</a>
            <a href="#terms" className="text-ink text-sm tracking-tight hover:text-action transition-colors">Terms</a>
            {requirements.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRequirementsOpen((v) => !v)}
                  className="bg-transparent border-none p-0 font-inherit cursor-pointer text-ink text-sm tracking-tight hover:text-action transition-colors flex items-center gap-1"
                >
                  Vehicle Requirements
                  <span className="text-[10px]">▾</span>
                </button>
                {requirementsOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[340px] bg-white border border-hairline rounded-[18px] p-4 flex flex-col gap-3 z-[60]">
                    <p className="text-xs font-semibold text-ink tracking-tight mb-1 uppercase">
                      Cars we need right now
                    </p>
                    {requirements.map((r, i) => (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between gap-3 ${
                          i < requirements.length - 1 ? "pb-3 border-b border-hairline" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold tracking-tight text-ink m-0">{r.title}</p>
                          <p className="text-xs tracking-tight text-ink-muted-48 mt-0.5">
                            {[r.color, r.quantity != null ? `${r.quantity} required` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <Link
                          to={`/requirements/${r.id}/apply`}
                          className="bg-action text-white text-xs rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-action-focus transition-colors"
                        >
                          Book Slot
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Link to="/login" className="text-ink text-sm tracking-tight hover:text-action transition-colors">
              Login
            </Link>
            <Link
              to="/get-started"
              className="bg-action text-white text-sm rounded-full px-[18px] py-2.5 hover:bg-action-focus active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section id="home" className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 pt-24 pb-20 flex flex-col items-center text-center">
          <span className="text-action text-sm font-semibold uppercase tracking-wide mb-5">
            Welcome to DP Tour &amp; Travels
          </span>
          <h1 className="text-hero-display text-ink max-w-3xl">
            Your car. Our care,
            <br />
            for five years.
          </h1>
          <p className="text-lead text-ink max-w-2xl mt-6">
            We handle maintenance, legal, and driver — you keep a guaranteed monthly income.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/get-started"
              className="bg-action text-white text-body-apple rounded-full px-[22px] py-[11px] hover:bg-action-focus active:scale-95 transition-all"
            >
              Get Started
            </Link>
            <a
              href="#owners"
              className="bg-transparent text-action border border-action text-body-apple rounded-full px-[21px] py-[10px] active:scale-95 transition-all"
            >
              See how it works
            </a>
          </div>
          <div className="w-full max-w-[920px] mt-16 rounded-[18px] overflow-hidden shadow-[3px_5px_30px_rgba(0,0,0,0.22)]">
            <img
              src="/hero-handover.jpg"
              alt="A car owner handing over their keys to a DP Tour and Travels representative"
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      {/* For Car Owners — dark tile */}
      <section id="owners" className="w-full bg-tile-1">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <span className="text-tagline text-link-on-dark">For Car Owners</span>
            <h2 className="text-tile-heading text-white mt-4">Hand it over. We take it from here.</h2>
            <p className="text-body-apple text-[#cccccc] mt-6 max-w-md">
              A 5-year lease on your brand-new car. We cover maintenance, servicing, driver, fuel, and every
              challan — you're only responsible for insurance.
            </p>
            <Link to="/get-started" className="inline-block text-link-on-dark text-body-apple font-semibold mt-6">
              Learn about leasing →
            </Link>
          </div>
          <div
            className="aspect-[4/3] rounded-[18px] shadow-[3px_5px_30px_rgba(0,0,0,0.22)] flex items-center justify-center"
            style={{ background: stripe("#333335", "#3a3a3c") }}
          >
            <span className="font-mono text-xs uppercase text-[#999999]">photo — owner handing over keys</span>
          </div>
        </div>
      </section>

      {/* For Dealers — parchment tile */}
      <section id="dealers" className="w-full bg-canvas-parchment">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div
            className="order-2 md:order-1 aspect-[4/3] rounded-[18px] shadow-[3px_5px_30px_rgba(0,0,0,0.22)] flex items-center justify-center"
            style={{ background: stripe("#e8e8ea", "#dedee2") }}
          >
            <span className="font-mono text-xs uppercase text-ink-muted-48">photo — fleet of vehicles</span>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-tagline text-action">For Dealers</span>
            <h2 className="text-tile-heading text-ink mt-4">A fleet, fully managed.</h2>
            <p className="text-body-apple text-ink mt-6 max-w-md">
              Access brand-new vehicles without the overhead. We handle agreements and payments so you can
              focus on the road.
            </p>
            <Link to="/dealers/apply" className="inline-block text-action text-body-apple font-semibold mt-6">
              Explore fleet options →
            </Link>
          </div>
        </div>
      </section>

      {/* Terms & Conditions summary */}
      <section id="terms" className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-tile-heading text-ink">Terms, upfront.</h2>
            <p className="text-body-apple text-ink-muted-80 mt-4 max-w-xl mx-auto">
              No surprises. Here's what we ask before you hand over your car.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {terms.map((t) => (
              <div key={t} className="bg-white border border-hairline rounded-[18px] p-6">
                <p className="text-body-apple text-ink">{t}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-ink-muted-48 mt-8">
            Double-check the exact variant at survey stage — purchase that same trim from the showroom.
          </p>
        </div>
      </section>

      {/* Apply for Dealer CTA — dark tile */}
      <section className="w-full bg-tile-2">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 text-center">
          <h2 className="text-tile-heading text-white">Want to run the fleet, not just a car?</h2>
          <p className="text-body-apple text-[#cccccc] mt-4 max-w-lg mx-auto">
            Become a DP Tour &amp; Travels dealer and get access to a growing fleet of brand-new vehicles.
          </p>
          <Link
            to="/dealers/apply"
            className="inline-block bg-action text-white text-body-apple rounded-full px-[22px] py-[11px] mt-8 hover:bg-action-focus active:scale-95 transition-all"
          >
            Apply for Dealer
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-canvas-parchment">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="text-tagline text-ink">DP Tour &amp; Travels</span>
            <p className="text-xs text-ink-muted-48 mt-3 max-w-[260px]">
              Precision in logistics, care in every journey.
            </p>
          </div>
          <div>
            <p className="text-label-sm text-ink mb-1">Company</p>
            <div className="flex flex-col">
              <a href="#owners" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">About us</a>
              <a href="#terms" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Why choose us</a>
              <a href="#" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Contact us</a>
            </div>
          </div>
          <div>
            <p className="text-label-sm text-ink mb-1">Portals</p>
            <div className="flex flex-col">
              <Link to="/login" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Client Login</Link>
              <Link to="/login" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Dealer Login</Link>
              <Link to="/dealers/apply" className="text-dense-link text-ink-muted-80 hover:text-action transition-colors">Apply for Dealer</Link>
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
    </div>
  );
}
