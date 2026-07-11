import type { Route } from "./+types/client";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["client"]);
}

export default function ClientDashboard({ loaderData }: Route.ComponentProps) {
  return <DashboardShell title="Client dashboard" name={loaderData.name} email={loaderData.email} />;
}
