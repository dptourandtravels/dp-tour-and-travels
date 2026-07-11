import type { Route } from "./+types/intake";
import { requireUser } from "../../lib/auth.server";
import { listIntakeApplications } from "../../lib/intake.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const applications = await listIntakeApplications();
  return { applications };
}

export default function Intake({ loaderData }: Route.ComponentProps) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Name</th>
          <th className="py-2">Contact</th>
          <th className="py-2">Car</th>
          <th className="py-2">Requirement</th>
          <th className="py-2">Submitted</th>
        </tr>
      </thead>
      <tbody>
        {loaderData.applications.map(({ application, requirement }) => (
          <tr key={application.id} className="border-b align-top">
            <td className="py-2">{application.name}</td>
            <td className="py-2">
              {application.email}
              <br />
              {application.phone}
            </td>
            <td className="py-2">
              {application.carMake} {application.carModel}
            </td>
            <td className="py-2">{requirement.title}</td>
            <td className="py-2">{new Date(application.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
        {loaderData.applications.length === 0 && (
          <tr>
            <td colSpan={5} className="py-4 text-gray-500">
              No submissions yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
