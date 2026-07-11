import { Link } from "react-router";
import type { Route } from "./+types/home";
import { listOpenCarRequirements } from "../lib/requirements.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DP Tour and Travels" },
    {
      name: "description",
      content: "Lease your car to DP Tour and Travels for a steady payout, or apply to become a dealer.",
    },
  ];
}

export async function loader() {
  const requirements = await listOpenCarRequirements();
  return { requirements };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="max-w-2xl mx-auto pt-16 px-4 pb-16">
      <div className="flex justify-end text-sm mb-8">
        <Link to="/login" className="underline">
          Staff / client sign in
        </Link>
      </div>

      <h1 className="text-3xl font-semibold mb-4">DP Tour and Travels</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        We build relationships, not just deals. Hand over your brand-new car and we treat it — and you — like
        family: full satisfaction and approval of the car owner at every step. You cover the insurance; we
        handle maintenance, servicing, driver, fuel, and challans for the full 5-year term, backed by a steady
        monthly payout.
      </p>
      <p className="text-sm mb-10">
        <Link to="/terms" className="underline">
          Terms &amp; conditions
        </Link>
      </p>

      <h2 className="text-xl font-semibold mb-4">Cars we're looking for right now</h2>
      {loaderData.requirements.length === 0 && (
        <p className="text-gray-500 mb-10">No open requirements at the moment — check back soon.</p>
      )}
      {loaderData.requirements.length > 0 && (
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">S. No.</th>
                <th className="py-2 pr-2">Vehicle Model &amp; Color</th>
                <th className="py-2 pr-2">Qty. Required</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loaderData.requirements.map((r, i) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="py-2 pr-2">{i + 1}</td>
                  <td className="py-2 pr-2">
                    {r.title}
                    {r.color && ` — ${r.color}`}
                    {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                  </td>
                  <td className="py-2 pr-2">{r.quantity ?? "—"}</td>
                  <td className="py-2">
                    <Link to={`/requirements/${r.id}/apply`} className="underline text-sm">
                      Book Slot
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Want to become a dealer?</h2>
      <Link to="/dealers/apply" className="underline">
        Apply for dealer access
      </Link>
    </main>
  );
}
