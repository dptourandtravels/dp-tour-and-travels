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
        <h2 className="text-lg font-semibold mb-2">Stock</h2>
        {stock.length === 0 ? (
          <p className="text-sm text-gray-500">No cars yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Car</th>
                <th className="py-2">Availability</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">
                    {c.make} {c.model}
                    <br />
                    {c.registrationNumber}
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
        <h2 className="text-lg font-semibold mb-2">Your assigned cars</h2>
        {assignedCars.length === 0 ? (
          <p className="text-sm text-gray-500">No cars assigned to you yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Car</th>
                <th className="py-2">Lease dates</th>
                <th className="py-2">Client (owner)</th>
              </tr>
            </thead>
            <tbody>
              {assignedCars.map(({ car, client }) => (
                <tr key={car.id} className="border-b">
                  <td className="py-2">
                    {car.make} {car.model}
                    <br />
                    {car.registrationNumber}
                  </td>
                  <td className="py-2">
                    {car.leaseStartDate ? new Date(car.leaseStartDate).toLocaleDateString() : "—"} –{" "}
                    {car.leaseEndDate ? new Date(car.leaseEndDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2">
                    {client.name}
                    <br />
                    {client.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Request a car</h2>
        {actionData && "error" in actionData && <p className="text-red-600 text-sm mb-2">{actionData.error}</p>}
        {actionData && "success" in actionData && <p className="text-green-600 text-sm mb-2">Request submitted.</p>}
        <Form method="post" className="flex flex-col gap-3 max-w-sm">
          <input name="carMake" placeholder="Make" required className="border rounded px-3 py-2" />
          <input name="carModel" placeholder="Model" required className="border rounded px-3 py-2" />
          <input name="quantity" type="number" min="1" placeholder="Quantity" required className="border rounded px-3 py-2" />
          <textarea name="message" placeholder="Anything else? (optional)" className="border rounded px-3 py-2" />
          <button type="submit" className="bg-black text-white rounded px-3 py-2 w-fit">
            Submit request
          </button>
        </Form>

        {myRequests.length > 0 && (
          <ul className="mt-4 text-sm flex flex-col gap-1">
            {myRequests.map((r) => (
              <li key={r.id}>
                {r.quantity}x {r.carMake} {r.carModel} — {r.status} ({new Date(r.createdAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Agreements</h2>
        {agreements.length === 0 ? (
          <p className="text-sm text-gray-500">No agreements issued yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {agreements.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b pb-2">
                <span>
                  {a.carDescription} — {a.registrationNumber}
                </span>
                <a href={`/agreements/${a.id}/download`} target="_blank" rel="noreferrer" className="text-xs underline">
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
