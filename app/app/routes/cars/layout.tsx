import { Link, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser } from "../../lib/auth.server";
import { SidebarShell } from "../../components/sidebar-shell";
import { getNavGroups } from "../../lib/admin-nav";
import type { Role } from "../../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["finance", "superadmin"]);
}

export default function CarsLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarShell user={loaderData} navGroups={getNavGroups(loaderData.role as Role)}>
      <h1 className="text-2xl font-semibold mb-6">Cars &amp; payments</h1>

      <nav className="flex gap-4 mb-8 text-sm underline">
        <Link to="/cars">All cars</Link>
        <Link to="/cars/new">Register car</Link>
      </nav>

      <Outlet />
    </SidebarShell>
  );
}
