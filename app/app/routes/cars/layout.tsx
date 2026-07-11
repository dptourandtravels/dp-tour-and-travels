import { Link, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser, dashboardPathForRole } from "../../lib/auth.server";
import type { Role } from "../../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["finance", "superadmin"]);
}

export default function CarsLayout({ loaderData }: Route.ComponentProps) {
  return (
    <main className="max-w-3xl mx-auto pt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cars &amp; payments</h1>
        <Link to={dashboardPathForRole(loaderData.role as Role)} className="text-sm underline">
          Back to dashboard
        </Link>
      </div>
      <nav className="flex gap-4 mb-8 text-sm underline">
        <Link to="/cars">All cars</Link>
        <Link to="/cars/new">Register car</Link>
      </nav>
      <Outlet />
    </main>
  );
}
