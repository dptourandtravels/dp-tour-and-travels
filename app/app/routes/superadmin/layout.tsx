import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser } from "../../lib/auth.server";
import { SidebarShell } from "../../components/sidebar-shell";
import { getNavGroups } from "../../lib/admin-nav";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["superadmin"]);
}

export default function SuperadminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarShell user={loaderData} navGroups={getNavGroups("superadmin")}>
      <Outlet />
    </SidebarShell>
  );
}
