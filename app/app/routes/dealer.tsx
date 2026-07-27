import { data, Form } from "react-router";
import type { Route } from "./+types/dealer";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";
import {
  listStockOverview,
  listAssignedCarsForDealer,
  listStockRequestsForDealer,
  submitStockRequest,
} from "../lib/dealer-stock.server";
import { listAgreementsForParty } from "../lib/agreements.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["dealer"]);
  const [stock, assignedCars, myRequests, agreements] = await Promise.all([
    listStockOverview(),
    listAssignedCarsForDealer(user.id),
    listStockRequestsForDealer(user.id),
    listAgreementsForParty(user.id),
  ]);
  return { user, stock, assignedCars, myRequests, agreements };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request, ["dealer"]);
  const form = await request.formData();
  const carMake = String(form.get("carMake") ?? "").trim();
  const carModel = String(form.get("carModel") ?? "").trim();
  const quantity = Number(form.get("quantity") ?? "");
  const message = String(form.get("message") ?? "");

  if (!carMake || !carModel || !Number.isInteger(quantity) || quantity <= 0) {
    return data({ error: "Make, model, and a valid quantity are required." }, { status: 400 });
  }

  await submitStockRequest({ dealerId: user.id, carMake, carModel, quantity, message });
  return data({ success: true as const });
}

export default function DealerDashboard({ loaderData, actionData }: Route.ComponentProps) {
  const { user, stock, assignedCars, myRequests, agreements } = loaderData;

  return (
    <DashboardShell title="Dealer dashboard" name={user.name} email={user.email}>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Stock</h2>
        {stock.length === 0 ? (
          <p className="text-sm text-ink-muted-48">No cars yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-hairline text-ink-muted-48">
                <th className="py-2 font-medium">Car</th>
                <th className="py-2 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((c) => (
                <tr key={c.id} className="border-b border-hairline text-ink">
                  <td className="py-2">
                    {c.make} {c.model}
                    <br />
                    <span className="text-ink-muted-80">{c.registrationNumber}</span>
                  </td>
                  <td className="py-2">
                    {c.dealerId ? (
                      c.leaseEndDate ? `Leased until ${new Date(c.leaseEndDate).toLocaleDateString()}` : "Leased"
                    ) : (
                      <span className="text-green-600">Available now</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Your assigned cars</h2>
        {assignedCars.length === 0 ? (
          <p className="text-sm text-ink-muted-48">No cars assigned to you yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-hairline text-ink-muted-48">
                <th className="py-2 font-medium">Car</th>
                <th className="py-2 font-medium">Lease dates</th>
                <th className="py-2 font-medium">Client (owner)</th>
              </tr>
            </thead>
            <tbody>
              {assignedCars.map(({ car, client }) => (
                <tr key={car.id} className="border-b border-hairline text-ink">
                  <td className="py-2">
                    {car.make} {car.model}
                    <br />
                    <span className="text-ink-muted-80">{car.registrationNumber}</span>
                  </td>
                  <td className="py-2">
                    {car.leaseStartDate ? new Date(car.leaseStartDate).toLocaleDateString() : "—"} –{" "}
                    {car.leaseEndDate ? new Date(car.leaseEndDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2">
                    {client.name}
                    <br />
                    <span className="text-ink-muted-80">{client.email}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Request a car</h2>
        {actionData && "error" in actionData && <p className="text-red-600 text-sm mb-2">{actionData.error}</p>}
        {actionData && "success" in actionData && <p className="text-green-600 text-sm mb-2">Request submitted.</p>}
        <Form method="post" className="flex flex-col gap-4 max-w-sm">
          <input
            name="carMake"
            placeholder="Make"
            required
            className="border border-hairline rounded-lg px-3 py-2 text-sm text-ink bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/40 focus:border-action"
          />
          <input
            name="carModel"
            placeholder="Model"
            required
            className="border border-hairline rounded-lg px-3 py-2 text-sm text-ink bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/40 focus:border-action"
          />
          <input
            name="quantity"
            type="number"
            min="1"
            placeholder="Quantity"
            required
            className="border border-hairline rounded-lg px-3 py-2 text-sm text-ink bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/40 focus:border-action"
          />
          <textarea
            name="message"
            placeholder="Anything else? (optional)"
            className="border border-hairline rounded-lg px-3 py-2 text-sm text-ink bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/40 focus:border-action"
          />
          <button
            type="submit"
            className="bg-action text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-action-focus transition-colors w-fit"
          >
            Submit request
          </button>
        </Form>

        {myRequests.length > 0 && (
          <ul className="mt-4 text-sm text-ink flex flex-col gap-1">
            {myRequests.map((r) => (
              <li key={r.id}>
                {r.quantity}x {r.carMake} {r.carModel} — {r.status} ({new Date(r.createdAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Agreements</h2>
        {agreements.length === 0 ? (
          <p className="text-sm text-ink-muted-48">No agreements issued yet.</p>
        ) : (
          <ul className="flex flex-col">
            {agreements.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-hairline py-3">
                <span className="text-ink">
                  {a.carDescription} — {a.registrationNumber}
                </span>
                <a
                  href={`/agreements/${a.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-action hover:underline"
                >
                  View / Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
