import type { Route } from "./+types/dealer-stock-requests";
import { requireUser } from "../../lib/auth.server";
import { listAllStockRequests } from "../../lib/dealer-stock.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const requests = await listAllStockRequests();
  return { requests };
}

export default function DealerStockRequests({ loaderData }: Route.ComponentProps) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Dealer</th>
          <th className="py-2">Car</th>
          <th className="py-2">Qty</th>
          <th className="py-2">Message</th>
          <th className="py-2">Submitted</th>
        </tr>
      </thead>
      <tbody>
        {loaderData.requests.map(({ request, dealer }) => (
          <tr key={request.id} className="border-b align-top">
            <td className="py-2">
              {dealer.name}
              <br />
              {dealer.email}
            </td>
            <td className="py-2">
              {request.carMake} {request.carModel}
            </td>
            <td className="py-2">{request.quantity}</td>
            <td className="py-2">{request.message}</td>
            <td className="py-2">{new Date(request.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
        {loaderData.requests.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-gray-500">
              No requests yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
