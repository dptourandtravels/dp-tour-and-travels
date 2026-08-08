import { data, Link } from "react-router";
import type { Route } from "./+types/finance";
import { requireUser } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { listCarsWithPayments } from "../lib/cars.server";
import { listNotificationsForUser, markAllNotificationsRead } from "../lib/notifications.server";
import { NotificationsPanel } from "../components/notifications-panel";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireUser(request, ["finance"]);
  const [rows, notifications] = await Promise.all([
    listCarsWithPayments(),
    listNotificationsForUser(actor.id),
  ]);

  const sum = (list: typeof rows) => list.reduce((t, r) => t + r.payment.amount, 0);
  const overdue = rows.filter((r) => r.payment.status === "red");
  const outstanding = rows.filter((r) => r.payment.status === "green" && !r.payment.paidAt);
  const collected = rows.filter((r) => r.payment.paidAt);

  return {
    actor,
    notifications,
    stats: {
      overdueTotal: sum(overdue),
      overdueCount: overdue.length,
      outstandingTotal: sum(outstanding),
      outstandingCount: outstanding.length,
      collectedTotal: sum(collected),
      collectedCount: collected.length,
      carsCount: new Set(rows.map((r) => r.car.id)).size,
    },
    overdue: overdue.slice(0, 6).map((r) => ({
      id: r.payment.id,
      client: r.client.name,
      car: `${r.car.make} ${r.car.model}`,
      registration: r.car.registrationNumber,
      amount: r.payment.amount,
      dueDate: r.payment.dueDate,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance"]);
  await markAllNotificationsRead(actor.id);
  return data({ success: true as const });
}

function StatCard({
  label,
  value,
  detail,
  icon,
  urgent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  urgent?: boolean;
}) {
  return (
    <Link
      to="/cars"
      className={`group relative overflow-hidden block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        urgent
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white hover:border-red-300"
          : "border-hairline bg-surface-pearl glass-card hover:border-action/30"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p
          className={`text-[11px] font-bold uppercase tracking-widest ${
            urgent ? "text-red-600" : "text-ink-muted-48"
          }`}
        >
          {label}
        </p>
        <span
          className={`material-symbols-outlined text-[20px] p-2 rounded-full transition-colors ${
            urgent
              ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
              : "bg-black/[0.03] text-ink-muted-48 group-hover:bg-action group-hover:text-white"
          }`}
        >
          {icon}
        </span>
      </div>
      <p
        className={`text-3xl font-bold tabular-nums tracking-tight ${
          urgent ? "text-red-700" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="text-[13px] text-ink-muted-80 mt-2 font-medium">{detail}</p>
    </Link>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6 glass-card">
      <h2 className="text-lg font-semibold text-ink mb-5 flex items-center gap-2 border-b border-hairline pb-4">
        <span className="material-symbols-outlined text-action">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function FinanceDashboard({ loaderData }: Route.ComponentProps) {
  const { actor, stats, overdue, notifications } = loaderData;

  return (
    <SidebarShell user={actor} navGroups={getNavGroups("finance")}>
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 pb-12">
        <div className="border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Finance Dashboard</h1>
          <p className="text-base text-ink-muted-80">Track payouts, collections, and overdue payments.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/cars"
            className="flex items-center gap-2 rounded-xl bg-white border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-action hover:text-action hover:shadow-sm transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[18px] text-action transition-transform group-hover:scale-110">
              payments
            </span>
            Cars &amp; payments
          </Link>
          <Link
            to="/agreements/new"
            className="flex items-center gap-2 rounded-xl bg-white border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-action hover:text-action hover:shadow-sm transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[18px] text-action transition-transform group-hover:scale-110">
              history_edu
            </span>
            New agreement
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Overdue"
            value={inr.format(stats.overdueTotal)}
            detail={`${stats.overdueCount} payment${stats.overdueCount === 1 ? "" : "s"} past due`}
            icon="warning"
            urgent={stats.overdueCount > 0}
          />
          <StatCard
            label="Outstanding"
            value={inr.format(stats.outstandingTotal)}
            detail={`${stats.outstandingCount} upcoming payout${stats.outstandingCount === 1 ? "" : "s"}`}
            icon="schedule"
          />
          <StatCard
            label="Collected"
            value={inr.format(stats.collectedTotal)}
            detail={`${stats.collectedCount} payment${stats.collectedCount === 1 ? "" : "s"} settled`}
            icon="check_circle"
          />
          <StatCard
            label="Cars on lease"
            value={String(stats.carsCount)}
            detail="Active vehicles"
            icon="key"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Overdue payments" icon="priority_high">
            {overdue.length === 0 ? (
              <div className="flex flex-col items-center text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-green-600 mb-2">
                  task_alt
                </span>
                <p className="text-sm font-medium text-ink">All caught up</p>
                <p className="text-xs text-ink-muted-48 mt-1">No payments are past due.</p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {overdue.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 border-b border-hairline py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{p.client}</p>
                      <p className="text-xs text-ink-muted-48 truncate">
                        {p.car} · {p.registration}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-red-700 tabular-nums">
                        {inr.format(p.amount)}
                      </p>
                      <p className="text-xs text-ink-muted-48">
                        Due {new Date(p.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
                {stats.overdueCount > overdue.length && (
                  <li className="pt-3">
                    <Link to="/cars" className="text-sm text-action hover:underline">
                      View all {stats.overdueCount} overdue →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Panel>

          <Panel title="Notifications" icon="notifications_active">
            <NotificationsPanel rows={notifications} />
          </Panel>
        </div>
      </div>
    </SidebarShell>
  );
}
