import { data } from "react-router";
import type { Route } from "./+types/notifications";
import { requireUser } from "../lib/auth.server";
import { listNotificationsForUser, markAllNotificationsRead } from "../lib/notifications.server";
import { DashboardShell } from "../components/dashboard-shell";
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
  return (
    <DashboardShell title="Notifications" name={loaderData.user.name} email={loaderData.user.email}>
      <NotificationsPanel rows={loaderData.rows} />
    </DashboardShell>
  );
}
