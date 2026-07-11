import type { Route } from "./+types/dealer";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["dealer"]);
}

export default function DealerDashboard({ loaderData }: Route.ComponentProps) {
  return <DashboardShell title="Dealer dashboard" name={loaderData.name} email={loaderData.email} />;
}
