import type { Route } from "./+types/dealer-applications";
import { requireUser } from "../../lib/auth.server";
import { listDealerApplications } from "../../lib/dealer-applications.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const applications = await listDealerApplications();
  return { applications };
}

export default function DealerApplications({ loaderData }: Route.ComponentProps) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Name</th>
          <th className="py-2">Contact</th>
          <th className="py-2">Message</th>
          <th className="py-2">Submitted</th>
        </tr>
      </thead>
      <tbody>
        {loaderData.applications.map((a) => (
          <tr key={a.id} className="border-b align-top">
            <td className="py-2">{a.name}</td>
            <td className="py-2">
              {a.email}
              <br />
              {a.phone}
            </td>
            <td className="py-2">{a.message}</td>
            <td className="py-2">{new Date(a.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
        {loaderData.applications.length === 0 && (
          <tr>
            <td colSpan={4} className="py-4 text-gray-500">
              No applications yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
