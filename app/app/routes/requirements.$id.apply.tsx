import { data, Form, Link } from "react-router";
import type { Route } from "./+types/requirements.$id.apply";
import { getCarRequirement } from "../lib/requirements.server";
import { submitIntake } from "../lib/intake.server";

export async function loader({ params }: Route.LoaderArgs) {
  const requirement = await getCarRequirement(params.id);
  return { requirement };
}

export async function action({ request, params }: Route.ActionArgs) {
  const requirement = await getCarRequirement(params.id);
  if (!requirement || requirement.status !== "open") {
    return data({ error: "This requirement is no longer accepting submissions." }, { status: 400 });
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const carMake = String(form.get("carMake") ?? "").trim();
  const carModel = String(form.get("carModel") ?? "").trim();
  const message = String(form.get("message") ?? "");
  const acceptTerms = form.get("acceptTerms") === "on";

  if (!name || !email || !phone || !carMake || !carModel || !acceptTerms) {
    return data({ error: "Fill in all required fields and accept the terms & conditions." }, { status: 400 });
  }

  const { client, clientPassword } = await submitIntake({
    carRequirementId: params.id,
    name,
    email,
    phone,
    carMake,
    carModel,
    message,
  });

  return data({ submitted: { email: client.email, clientPassword } });
}

export default function ApplyForRequirement({ loaderData, actionData }: Route.ComponentProps) {
  if (actionData && "submitted" in actionData) {
    const { email, clientPassword } = actionData.submitted;
    return (
      <main className="max-w-sm mx-auto pt-24 px-4">
        <p className="mb-4">Thanks — we've received your details and will be in touch.</p>
        {clientPassword ? (
          <p className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 inline-block">
            Your account: {email} / {clientPassword}
          </p>
        ) : (
          <p>You already have an account — sign in with your existing email and password.</p>
        )}
        <Link to="#" className="block underline text-sm mt-4">
          Sign in
        </Link>
      </main>
    );
  }

  if (!loaderData.requirement || loaderData.requirement.status !== "open") {
    return (
      <main className="max-w-sm mx-auto pt-24 px-4">
        <p>This requirement is no longer accepting submissions.</p>
        <Link to="/" className="underline text-sm block mt-4">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto pt-16 px-4">
      <h1 className="text-2xl font-semibold mb-1">{loaderData.requirement.title}</h1>
      {loaderData.requirement.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{loaderData.requirement.description}</p>
      )}
      <Form method="post" className="flex flex-col gap-4">
        <input name="name" placeholder="Your name" required className="border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
        <input name="phone" type="tel" placeholder="Phone" required className="border rounded px-3 py-2" />
        <input name="carMake" placeholder="Car make" required className="border rounded px-3 py-2" />
        <input name="carModel" placeholder="Car model" required className="border rounded px-3 py-2" />
        <textarea name="message" placeholder="Anything else we should know? (optional)" className="border rounded px-3 py-2" />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" name="acceptTerms" required />
          <span>
            I accept the{" "}
            <Link to="/terms" target="_blank" className="underline">
              terms &amp; conditions
            </Link>
          </span>
        </label>
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Submit
        </button>
      </Form>
    </main>
  );
}
