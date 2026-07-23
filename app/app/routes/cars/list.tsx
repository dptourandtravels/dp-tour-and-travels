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

const inputClass =
  "border border-hairline rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-action/30 focus:border-action transition-all";
const smallButtonClass = "text-xs font-medium text-action hover:text-action-focus transition-colors";

export default function CarsList({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      {actionData && "error" in actionData && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionData.error}
        </p>
      )}

      {loaderData.rows.length === 0 ? (
        <div className="rounded-[18px] border border-hairline bg-surface-pearl p-10 text-center">
          <p className="text-body-apple text-ink-muted-80">No cars registered yet.</p>
        </div>
      ) : (
        <div className="rounded-[18px] border border-hairline bg-white overflow-x-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <table className="w-full text-sm border-collapse min-w-[860px]">
            <thead>
              <tr className="text-left border-b border-hairline bg-surface-pearl">
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Client
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Car
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Receipt date
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Payout due
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Amount (₹)
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Status
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Payout
                </th>
                <th className="py-3 px-4 text-label-sm text-ink-muted-48 uppercase tracking-wide font-semibold">
                  Dealer
                </th>
              </tr>
            </thead>
            <tbody>
              {loaderData.rows.map(({ car, payment, client }) => (
                <tr key={car.id} className="border-b border-hairline last:border-0 align-top hover:bg-black/[0.015]">
                  <td className="py-3 px-4">
                    <p className="text-ink">{client.name}</p>
                    <p className="text-ink-muted-48 text-xs">{client.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-ink">
                      {car.make} {car.model}
                    </p>
                    <p className="text-ink-muted-48 text-xs">{car.registrationNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-ink-muted-80">{new Date(car.receiptDate).toLocaleDateString("en-GB")}</td>
                  <td className="py-3 px-4 text-ink-muted-80">{new Date(payment.dueDate).toLocaleDateString("en-GB")}</td>
                  <td className="py-3 px-4">
                    <Form method="post" action="?index" className="flex gap-1.5 items-center">
                      <input type="hidden" name="intent" value="edit_amount" />
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        defaultValue={payment.amount}
                        className={`${inputClass} w-24`}
                      />
                      <button type="submit" className={smallButtonClass}>
                        Save
                      </button>
                    </Form>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        payment.status === "green" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {payment.status === "green" ? "On track" : "Overdue"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {payment.paidAt ? (
                      <span className="text-ink-muted-80 text-xs">
                        Paid{payment.method ? ` (${payment.method})` : ""}
                      </span>
                    ) : (
                      <Form method="post" action="?index" className="flex gap-1.5 items-center">
                        <input type="hidden" name="intent" value="mark_paid" />
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <select name="method" required className={inputClass}>
                          <option value="">Method</option>
                          {paymentMethods.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={smallButtonClass}>
                          Mark paid
                        </button>
                      </Form>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {car.dealerId ? (
                      <>
                        <p className="text-ink">{loaderData.dealers.find((d) => d.id === car.dealerId)?.name ?? "—"}</p>
                        <p className="text-ink-muted-48 text-xs">
                          {car.leaseStartDate ? new Date(car.leaseStartDate).toLocaleDateString("en-GB") : "—"} –{" "}
                          {car.leaseEndDate ? new Date(car.leaseEndDate).toLocaleDateString("en-GB") : "—"}
                        </p>
                      </>
                    ) : (
                      <Form method="post" action="?index" className="flex flex-col gap-1.5 w-40">
                        <input type="hidden" name="intent" value="assign_dealer" />
                        <input type="hidden" name="carId" value={car.id} />
                        <select name="dealerId" required className={inputClass}>
                          <option value="">Dealer</option>
                          {loaderData.dealers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <input name="leaseStartDate" type="date" required className={inputClass} />
                        <input name="leaseEndDate" type="date" required className={inputClass} />
                        <button type="submit" className={`${smallButtonClass} w-fit`}>
                          Assign
                        </button>
                      </Form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
