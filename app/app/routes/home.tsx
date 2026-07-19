import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DP Tour & Travels" },
    {
      name: "description",
      content: "DP Tour and Travels",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Navigation Bar */}
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-6 md:px-12 h-20">
          {/* Brand Name */}
          <Link className="flex items-center gap-3 group" to="/">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              DP Tour &amp; Travels
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-primary font-bold border-b-2 border-secondary font-label-md text-label-md py-1"
              href="#home"
            >
              Home
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md hover:-translate-y-0.5 duration-200"
              href="#about"
            >
              About us
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md hover:-translate-y-0.5 duration-200"
              href="#why-choose-us"
            >
              Why choose us
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg text-primary font-label-md text-label-md font-medium hover:bg-surface-variant transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link
              to="/get-started"
              className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/30 active:scale-95 font-label-md text-label-md font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-fixed/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 pointer-events-none"></div>

        <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/20 border border-secondary/20 text-on-secondary-container font-label-sm text-sm shadow-sm mb-8">
            <span className="font-semibold tracking-wide uppercase">
              Welcome to DP Tour & Travels
            </span>
          </div>

          <h1 className="font-display-lg text-5xl md:text-7xl font-extrabold text-primary tracking-tight leading-[1.1] max-w-4xl mb-6">
            We don't build businesses, we build{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-500">
              relationships.
            </span>
          </h1>

          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Experience logistics and fleet management with precision, care, and a partnership you can genuinely trust. We bridge the gap between operation and ownership.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/get-started"
              className="px-8 py-4 rounded-xl bg-primary text-white hover:bg-blue-900 transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 font-label-md text-label-md font-semibold text-center flex items-center justify-center gap-2 group"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="#about"
              className="px-8 py-4 rounded-xl bg-white border-2 border-outline-variant/50 text-primary hover:border-primary hover:bg-surface-variant/50 transition-all duration-300 font-label-md text-label-md font-semibold text-center flex items-center justify-center hover:-translate-y-1"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* How it works Section */}
        <section
          className="py-24 px-6 md:px-12 max-w-[1280px] mx-auto relative z-10"
          id="how-it-works"
        >
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
              Seamless Logistics,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Tailored for Your Role.
              </span>
            </h2>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Whether you're looking to earn passive income from your vehicle or
              seeking a professional fleet to operate, our ecosystem bridges the
              gap with care and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Car Owners Card */}
            <div className="p-10 rounded-[2rem] bg-gradient-to-b from-white to-surface-container-low border border-outline-variant/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm relative z-10">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-headline-md text-3xl font-bold text-primary mb-4 relative z-10">
                For Car Owners
              </h3>
              <p className="font-body-md text-on-surface-variant mb-10 leading-relaxed text-lg relative z-10">
                Hand over your brand-new car for a 5-year lease. We handle the
                rest—maintenance, legal, and guaranteed monthly earnings.
              </p>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 text-secondary font-bold text-lg hover:gap-4 transition-all relative z-10 group/link"
              >
                Learn about leasing
                <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* For Dealers Card */}
            <div className="p-10 rounded-[2rem] bg-gradient-to-br from-primary to-blue-950 text-white shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 translate-x-1/4 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-on-secondary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-headline-md text-3xl font-bold text-secondary-fixed mb-4 relative z-10">
                For Dealers
              </h3>
              <p className="font-body-md text-primary-fixed/80 mb-10 leading-relaxed text-lg relative z-10">
                Access a fleet of brand-new vehicles. We manage the agreements
                and payments so you can focus on the road.
              </p>
              <Link
                to="/dealers/apply"
                className="inline-flex items-center gap-2 text-secondary-fixed font-bold text-lg hover:gap-4 transition-all relative z-10 group/link"
              >
                Explore fleet options
                <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="w-full pt-20 pb-10 bg-primary text-primary-fixed relative overflow-hidden mt-20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-10 relative z-10">
          <div className="flex flex-col gap-3 text-center md:text-left w-full md:w-1/3">
            <span className="font-headline-md text-2xl font-bold text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-secondary to-yellow-400 shrink-0"></div>
              DP Tour &amp; Travels
            </span>
            <p className="text-primary-fixed/60 font-body-md text-sm mt-2">
              © {new Date().getFullYear()} DP Tour and Travels. Precision in
              Logistics, Care in Every Journey.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 w-full md:w-2/3 md:pt-2">
            <Link
              to="/terms"
              className="text-primary-fixed/80 hover:text-secondary-fixed transition-colors duration-300 font-medium text-sm hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-primary-fixed/80 hover:text-secondary-fixed transition-colors duration-300 font-medium text-sm hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <a
              href="#"
              className="text-primary-fixed/80 hover:text-secondary-fixed transition-colors duration-300 font-medium text-sm hover:underline underline-offset-4"
            >
              Contact Us
            </a>
            <Link
              to="/dealers/apply"
              className="text-primary-fixed/80 hover:text-secondary-fixed transition-colors duration-300 font-medium text-sm hover:underline underline-offset-4"
            >
              Fleet Management
            </Link>
            <Link
              to="/login"
              className="text-primary-fixed/80 hover:text-secondary-fixed transition-colors duration-300 font-medium text-sm hover:underline underline-offset-4 whitespace-nowrap"
            >
              Partner Sign In
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

