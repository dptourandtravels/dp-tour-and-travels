import { data, Form } from "react-router";
import type { Route } from "./+types/new";
import { requireUser } from "../../lib/auth.server";
import { createCarWithPayment } from "../../lib/cars.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["finance", "superadmin"]);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const form = await request.formData();

  const clientEmail = String(form.get("clientEmail") ?? "");
  const clientName = String(form.get("clientName") ?? "");
  const make = String(form.get("make") ?? "").trim();
  const model = String(form.get("model") ?? "").trim();
  const registrationNumber = String(form.get("registrationNumber") ?? "").trim();
  const receiptDateStr = String(form.get("receiptDate") ?? "");
  const amount = Number(form.get("amount"));

  if (
    !clientEmail.trim() ||
    !clientName.trim() ||
    !make ||
    !model ||
    !registrationNumber ||
    !receiptDateStr ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return data({ error: "All fields are required and amount must be a positive number." }, { status: 400 });
  }

  const receiptDate = new Date(receiptDateStr);
  if (Number.isNaN(receiptDate.getTime())) {
    return data({ error: "Invalid receipt date." }, { status: 400 });
  }

  const result = await createCarWithPayment(
    { clientEmail, clientName, make, model, registrationNumber, receiptDate, amount },
    actor.id,
  );

  return data({ created: result });
}

export default function NewCar({ actionData }: Route.ComponentProps) {
  if (actionData && "created" in actionData) {
    const { client, clientPassword } = actionData.created;
    return (
      <div>
        <p className="mb-2">Car registered and payout scheduled.</p>
        {clientPassword && (
          <p className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 inline-block">
            New client login: {client.email} / {clientPassword}
          </p>
        )}
      </div>
    );
  }

  return (
    <Form method="post" className="flex flex-col gap-4 max-w-sm">
      <input name="clientEmail" type="email" placeholder="Client email" required className="border rounded px-3 py-2" />
      <input name="clientName" placeholder="Client name" required className="border rounded px-3 py-2" />
      <input name="make" placeholder="Make" required className="border rounded px-3 py-2" />
      <input name="model" placeholder="Model" required className="border rounded px-3 py-2" />
      <input
        name="registrationNumber"
        placeholder="Registration number"
        required
        className="border rounded px-3 py-2"
      />
      <label className="text-sm flex flex-col gap-1">
        Receipt date
        <input name="receiptDate" type="date" required className="border rounded px-3 py-2" />
      </label>
      <label className="text-sm flex flex-col gap-1">
        Payout amount (₹)
        <input name="amount" type="number" min="1" required className="border rounded px-3 py-2" />
      </label>
      {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
      <button type="submit" className="bg-black text-white rounded px-3 py-2">
        Register car
      </button>
    </Form>
  );
}
