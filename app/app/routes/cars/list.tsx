import { data, Form } from "react-router";
import type { Route } from "./+types/list";
import { requireUser } from "../../lib/auth.server";
import { listCarsWithPayments, markPaymentPaid, editPaymentAmount } from "../../lib/cars.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["finance", "superadmin"]);
  const rows = await listCarsWithPayments();
  return { rows };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const paymentId = String(form.get("paymentId") ?? "");

  if (intent === "mark_paid") {
    return data(await markPaymentPaid(paymentId, actor.id));
  }

  if (intent === "edit_amount") {
    const amount = Number(form.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      return data({ error: "Amount must be a positive number." }, { status: 400 });
    }
    return data(await editPaymentAmount(paymentId, amount, actor.id));
  }

  return data({ error: "Unknown action." }, { status: 400 });
}

export default function CarsList({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      {actionData && "error" in actionData && <p className="text-red-600 text-sm mb-4">{actionData.error}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Client</th>
            <th className="py-2">Car</th>
            <th className="py-2">Receipt date</th>
            <th className="py-2">Payout due</th>
            <th className="py-2">Amount (₹)</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {loaderData.rows.map(({ car, payment, client }) => (
            <tr key={car.id} className="border-b align-top">
              <td className="py-2">
                {client.name}
                <br />
                {client.email}
              </td>
              <td className="py-2">
                {car.make} {car.model}
                <br />
                {car.registrationNumber}
              </td>
              <td className="py-2">{new Date(car.receiptDate).toLocaleDateString()}</td>
              <td className="py-2">{new Date(payment.dueDate).toLocaleDateString()}</td>
              <td className="py-2">
                <Form method="post" action="?index" className="flex gap-1 items-center">
                  <input type="hidden" name="intent" value="edit_amount" />
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    defaultValue={payment.amount}
                    className="border rounded px-2 py-1 w-24"
                  />
                  <button type="submit" className="text-xs underline">
                    Save
                  </button>
                </Form>
              </td>
              <td className="py-2">
                <span className={payment.status === "green" ? "text-green-600" : "text-red-600"}>
                  {payment.status.toUpperCase()}
                </span>
              </td>
              <td className="py-2">
                {payment.paidAt ? (
                  "Paid"
                ) : (
                  <Form method="post" action="?index">
                    <input type="hidden" name="intent" value="mark_paid" />
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <button type="submit" className="text-xs underline">
                      Mark paid
                    </button>
                  </Form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
