import { data, Link } from "react-router";
import type { Route } from "./+types/finance";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";
import { listNotificationsForUser, markAllNotificationsRead } from "../lib/notifications.server";
import { NotificationsPanel } from "../components/notifications-panel";

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireUser(request, ["finance"]);
  const notifications = await listNotificationsForUser(actor.id);
  return { actor, notifications };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance"]);
  await markAllNotificationsRead(actor.id);
  return data({ success: true as const });
}

export default function FinanceDashboard({ loaderData }: Route.ComponentProps) {
  return (
    <DashboardShell title="Finance dashboard" name={loaderData.actor.name} email={loaderData.actor.email}>
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          to="/cars"
          className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:border-action hover:text-action transition-colors"
        >
          Cars &amp; payments
        </Link>
        <Link
          to="/agreements/new"
          className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:border-action hover:text-action transition-colors"
        >
          New agreement
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-ink mb-3">Notifications</h2>
      <NotificationsPanel rows={loaderData.notifications} />
    </DashboardShell>
  );
}
