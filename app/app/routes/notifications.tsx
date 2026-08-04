import { data } from "react-router";
import type { Route } from "./+types/notifications";
import { requireUser } from "../lib/auth.server";
import { listNotificationsForUser, markAllNotificationsRead } from "../lib/notifications.server";
import { DashboardShell } from "../components/dashboard-shell";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { NotificationsPanel } from "../components/notifications-panel";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const rows = await listNotificationsForUser(user.id);
  return { user, rows };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  await markAllNotificationsRead(user.id);
  return data({ success: true as const });
}

export default function Notifications({ loaderData }: Route.ComponentProps) {
  const { user, rows } = loaderData;

  if (user.role === "client") {
    return (
      <SidebarShell user={user} navGroups={getNavGroups("client")}>
        <div className="max-w-4xl mx-auto w-full pb-12">
          <div className="mb-8 border-b border-hairline pb-6">
            <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Notifications</h1>
          </div>
          <NotificationsPanel rows={rows} formAction="/notifications" />
        </div>
      </SidebarShell>
    );
  }

  return (
    <DashboardShell title="Notifications" name={user.name} email={user.email}>
      <NotificationsPanel rows={rows} />
    </DashboardShell>
  );
}
