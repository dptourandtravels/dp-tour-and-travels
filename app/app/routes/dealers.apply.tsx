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

export default function DealersApply({ actionData }: Route.ComponentProps) {
  if (actionData && "submitted" in actionData) {
    return (
      <main className="max-w-sm mx-auto pt-24 px-4">
        <p>Thanks for applying — our team will review your application and get in touch.</p>
        <Link to="/" className="underline text-sm block mt-4">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto pt-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Apply for dealer access</h1>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        <p className="mb-2">Before you apply, you should:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Hold a valid dealer/trade license for vehicle rental or resale.</li>
          <li>Have a registered business address we can verify.</li>
          <li>Be able to take on at least one leased vehicle within 30 days of approval.</li>
        </ul>
      </div>
      <Form method="post" className="flex flex-col gap-4">
        <input name="name" placeholder="Your name" required className="border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
        <input name="phone" type="tel" placeholder="Phone" required className="border rounded px-3 py-2" />
        <textarea
          name="message"
          placeholder="Tell us about your business (optional)"
          className="border rounded px-3 py-2"
        />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Apply
        </button>
      </Form>
    </main>
  );
}
