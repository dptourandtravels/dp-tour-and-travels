import { data, Form } from "react-router";
import type { Route } from "./+types/list";
import { requireUser, listUsersByRole } from "../../lib/auth.server";
import { listCarsWithPayments, markPaymentPaid, editPaymentAmount } from "../../lib/cars.server";
import { assignCarToDealer } from "../../lib/dealer-stock.server";
import { paymentMethods, type PaymentMethod } from "../../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["finance", "superadmin"]);
  const [rows, dealers] = await Promise.all([listCarsWithPayments(), listUsersByRole("dealer")]);
  return { rows, dealers };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const paymentId = String(form.get("paymentId") ?? "");

  if (intent === "mark_paid") {
    const method = String(form.get("method") ?? "");
    if (!paymentMethods.includes(method as PaymentMethod)) {
      return data({ error: "Select a payment method." }, { status: 400 });
    }
    return data(await markPaymentPaid(paymentId, actor.id, method as PaymentMethod));
  }

  if (intent === "edit_amount") {
    const amount = Number(form.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      return data({ error: "Amount must be a positive number." }, { status: 400 });
    }
    return data(await editPaymentAmount(paymentId, amount, actor.id));
  }

  if (intent === "assign_dealer") {
    const carId = String(form.get("carId") ?? "");
    const dealerId = String(form.get("dealerId") ?? "");
    const leaseStartDate = new Date(String(form.get("leaseStartDate") ?? ""));
    const leaseEndDate = new Date(String(form.get("leaseEndDate") ?? ""));
    if (!carId || !dealerId || Number.isNaN(leaseStartDate.getTime()) || Number.isNaN(leaseEndDate.getTime())) {
      return data({ error: "Select a dealer and both lease dates." }, { status: 400 });
    }
    await assignCarToDealer({ carId, dealerId, leaseStartDate, leaseEndDate });
    return data({ success: true as const });
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
            <th className="py-2">Dealer</th>
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
              <td className="py-2">{new Date(car.receiptDate).toLocaleDateString("en-GB")}</td>
              <td className="py-2">{new Date(payment.dueDate).toLocaleDateString("en-GB")}</td>
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
                  {payment.status === "green" ? "ON TRACK" : "OVERDUE"}
                </span>
              </td>
              <td className="py-2">
                {payment.paidAt ? (
                  `Paid${payment.method ? ` (${payment.method})` : ""}`
                ) : (
                  <Form method="post" action="?index" className="flex gap-1 items-center">
                    <input type="hidden" name="intent" value="mark_paid" />
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <select name="method" required className="border rounded px-1 py-1 text-xs">
                      <option value="">Method</option>
                      {paymentMethods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs underline">
                      Mark paid
                    </button>
                  </Form>
                )}
              </td>
              <td className="py-2">
                {car.dealerId ? (
                  <>
                    {loaderData.dealers.find((d) => d.id === car.dealerId)?.name ?? "—"}
                    <br />
                    {car.leaseStartDate ? new Date(car.leaseStartDate).toLocaleDateString("en-GB") : "—"} –{" "}
                    {car.leaseEndDate ? new Date(car.leaseEndDate).toLocaleDateString("en-GB") : "—"}
                  </>
                ) : (
                  <Form method="post" action="?index" className="flex flex-col gap-1">
                    <input type="hidden" name="intent" value="assign_dealer" />
                    <input type="hidden" name="carId" value={car.id} />
                    <select name="dealerId" required className="border rounded px-1 py-1 text-xs">
                      <option value="">Dealer</option>
                      {loaderData.dealers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <input name="leaseStartDate" type="date" required className="border rounded px-1 py-1 text-xs" />
                    <input name="leaseEndDate" type="date" required className="border rounded px-1 py-1 text-xs" />
                    <button type="submit" className="text-xs underline w-fit">
                      Assign
                    </button>
                  </Form>
                )}
              </td>
            </tr>
          ))}
          {loaderData.rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-4 text-gray-500">
                No cars registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
