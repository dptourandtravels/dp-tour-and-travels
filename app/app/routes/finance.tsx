import type { Route } from "./+types/finance";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["finance"]);
}

export default function FinanceDashboard({ loaderData }: Route.ComponentProps) {
  return <DashboardShell title="Finance dashboard" name={loaderData.name} email={loaderData.email} />;
}
