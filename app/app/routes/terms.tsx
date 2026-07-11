import { Link } from "react-router";

export function meta() {
  return [{ title: "Terms & Conditions — DP Tour and Travels" }];
}

export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto pt-16 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Terms &amp; Conditions</h1>
      <p className="text-sm text-gray-500 mb-6">Placeholder — replace with your real terms before going live.</p>
      <div className="flex flex-col gap-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          By submitting a car for lease to DP Tour and Travels, you confirm that you are the legal owner of the
          vehicle (or authorized to lease it), that the vehicle is in roadworthy condition, and that all
          documents provided are accurate.
        </p>
        <p>
          Payout amounts and schedules are agreed in writing via a signed lease agreement before your vehicle is
          taken into service. DP Tour and Travels is not liable for delays caused by incomplete or inaccurate
          information provided at intake.
        </p>
        <p>
          Your contact details will be used to create an account so you can track your car's status and payout
          schedule. We do not sell your data to third parties.
        </p>
      </div>
      <Link to="/" className="underline text-sm block mt-8">
        Back to home
      </Link>
    </main>
  );
}
