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

const inputClass =
  "border border-hairline rounded-[11px] px-4 py-[11px] bg-surface-pearl text-ink text-body-apple focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all";

export default function NewCar({ actionData }: Route.ComponentProps) {
  if (actionData && "created" in actionData) {
    const { client, clientPassword } = actionData.created;
    return (
      <div className="max-w-md rounded-[18px] border border-hairline bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <p className="text-tagline text-ink mb-4">Car registered and payout scheduled.</p>
        {clientPassword && (
          <div className="rounded-lg bg-surface-pearl border border-hairline px-4 py-3">
            <p className="text-label-sm text-ink-muted-48 uppercase tracking-wide mb-1">New client login</p>
            <p className="font-mono text-sm text-ink">
              {client.email} / {clientPassword}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Form method="post" className="flex flex-col gap-4 max-w-md rounded-[18px] border border-hairline bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <input name="clientEmail" type="email" placeholder="Client email" required className={inputClass} />
      <input name="clientName" placeholder="Client name" required className={inputClass} />
      <input name="make" placeholder="Make" required className={inputClass} />
      <input name="model" placeholder="Model" required className={inputClass} />
      <input name="registrationNumber" placeholder="Registration number" required className={inputClass} />
      <label className="flex flex-col gap-2">
        <span className="text-label-sm text-ink font-medium">Receipt date</span>
        <input name="receiptDate" type="date" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-label-sm text-ink font-medium">Payout amount (₹)</span>
        <input name="amount" type="number" min="1" required className={inputClass} />
      </label>
      {actionData && "error" in actionData && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionData.error}
        </p>
      )}
      <button
        type="submit"
        className="mt-2 bg-action text-white text-body-apple font-medium rounded-full px-4 py-[13px] hover:bg-action-focus active:scale-95 transition-all w-full"
      >
        Register car
      </button>
    </Form>
  );
}
