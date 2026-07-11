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
        Own a car sitting idle? Lease it to us for a steady monthly payout — we handle the rest. We supply
        well-maintained vehicles to our network of dealers, so your car stays on the road and your income
        stays predictable.
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
      <ul className="flex flex-col gap-4 mb-10">
        {loaderData.requirements.map((r) => (
          <li key={r.id} className="border rounded p-4">
            <p className="font-semibold">{r.title}</p>
            {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{r.description}</p>}
            <Link to={`/requirements/${r.id}/apply`} className="underline text-sm">
              I have this car — apply now
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-4">Want to become a dealer?</h2>
      <Link to="/dealers/apply" className="underline">
        Apply for dealer access
      </Link>
    </main>
  );
}
