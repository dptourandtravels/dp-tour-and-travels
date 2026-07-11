import { Link } from "react-router";

export function meta() {
  return [{ title: "Terms & Conditions — DP Tour and Travels" }];
}

const TERMS = [
  "Slot pre-booking is mandatory before delivering a car.",
  "Only brand-new cars are accepted.",
  "5-year insurance must be provided by the car owner.",
  "Only white-plate (private) cars are accepted.",
  "GPS devices in the car are strictly prohibited.",
  "The car owner must be handing over their car voluntarily.",
  "No installment may be missed during the 5-year term — missing a payment results in the owner being blacklisted and barred from running a car with DP Tour and Travels.",
  "Cars with more than 1,500–2,000 km on the odometer will not be accepted.",
];

export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto pt-16 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Terms &amp; Conditions</h1>
      <ol className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300 list-decimal pl-5">
        {TERMS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
        Please double-check the exact variant of the car you intend to hand over, and purchase that same variant
        from the showroom as agreed at survey stage.
      </p>
      <Link to="/" className="underline text-sm block mt-8">
        Back to home
      </Link>
    </main>
  );
}
