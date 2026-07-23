import { NavLink, Outlet } from "react-router";
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
      <h1 className="text-2xl font-semibold text-ink mb-6">Cars &amp; payments</h1>

      <nav className="flex gap-2 mb-8">
        <NavLink
          to="/cars"
          end
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm transition-colors ${
              isActive
                ? "bg-action text-white"
                : "border border-hairline text-ink hover:border-action hover:text-action"
            }`
          }
        >
          All cars
        </NavLink>
        <NavLink
          to="/cars/new"
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm transition-colors ${
              isActive
                ? "bg-action text-white"
                : "border border-hairline text-ink hover:border-action hover:text-action"
            }`
          }
        >
          Register car
        </NavLink>
      </nav>

      <Outlet />
    </SidebarShell>
  );
}
