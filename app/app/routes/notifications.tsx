import { data } from "react-router";
import type { Route } from "./+types/notifications";
import { requireUser } from "../lib/auth.server";
import { type Role } from "../db/schema";
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
  const navGroups = getNavGroups(user.role as Role);

  const card = (
    <div className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6 glass-card">
      <NotificationsPanel rows={rows} formAction="/notifications" />
    </div>
  );

  // Roles with a sidebar (client, user, finance, superadmin) get notifications as a page in their
  // own portal. Roles without one (dealer) fall back to the simple shell.
  if (navGroups.length > 0) {
    return (
      <SidebarShell user={user} navGroups={navGroups}>
        <div className="max-w-3xl mx-auto w-full pb-12">
          <div className="mb-8 border-b border-hairline pb-6">
            <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Notifications</h1>
            <p className="text-base text-ink-muted-80">Payment reminders and account updates.</p>
          </div>
          {card}
        </div>
      </SidebarShell>
    );
  }

  return (
    <DashboardShell title="Notifications" name={user.name} email={user.email}>
      <div className="mt-2">{card}</div>
    </DashboardShell>
  );
}
