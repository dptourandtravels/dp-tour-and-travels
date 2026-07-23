import { Link } from "react-router";
import type { Route } from "./+types/finance";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["finance"]);
}

export default function FinanceDashboard({ loaderData }: Route.ComponentProps) {
  return (
    <DashboardShell title="Finance dashboard" name={loaderData.name} email={loaderData.email}>
      <Link to="/superadmin/cars" className="block mt-4 text-sm underline">
        Cars &amp; payments
      </Link>
      <Link to="/agreements/new" className="block mt-2 text-sm underline">
        New agreement
      </Link>
    </DashboardShell>
  );
}
