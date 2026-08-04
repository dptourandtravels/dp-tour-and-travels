import { eq } from "drizzle-orm";
import { data, Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { requireUser, db } from "../../lib/auth.server";
import { users, cars, payments, carRequirements, dealerApplications, dealerStockRequests, roles, type Role } from "../../db/schema";
import { listNotificationsForUser, markAllNotificationsRead } from "../../lib/notifications.server";
import { NotificationsPanel } from "../../components/notifications-panel";

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireUser(request, ["superadmin"]);

  const [allUsers, allCars, overduePayments, openRequirements, applications, openStockRequests, notifications] =
    await Promise.all([
      db.select({ role: users.role }).from(users),
      db.select({ id: cars.id }).from(cars),
      db.select({ id: payments.id }).from(payments).where(eq(payments.status, "red")),
      db.select({ id: carRequirements.id }).from(carRequirements).where(eq(carRequirements.status, "open")),
      db.select({ id: dealerApplications.id }).from(dealerApplications),
      db.select({ id: dealerStockRequests.id }).from(dealerStockRequests).where(eq(dealerStockRequests.status, "open")),
      listNotificationsForUser(actor.id),
    ]);

  const usersByRole = Object.fromEntries(
    roles.map((role) => [role, allUsers.filter((u) => u.role === role).length]),
  ) as Record<Role, number>;

  return {
    totalUsers: allUsers.length,
    usersByRole,
    totalCars: allCars.length,
    overduePayments: overduePayments.length,
    openRequirements: openRequirements.length,
    dealerApplications: applications.length,
    openStockRequests: openStockRequests.length,
    notifications,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["superadmin"]);
  await markAllNotificationsRead(actor.id);
  return data({ success: true as const });
}

function StatTile({
  to,
  label,
  value,
  detail,
  urgent,
  icon,
}: {
  to: string;
  label: string;
  value: number;
  detail?: string;
  urgent?: boolean;
  icon: string;
}) {
  const isUrgentActive = urgent && value > 0;
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden block rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isUrgentActive
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white hover:border-red-300"
          : "border-hairline bg-surface-pearl glass-card hover:border-action/30"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[11px] font-bold uppercase tracking-widest ${
          isUrgentActive ? "text-red-600" : "text-ink-muted-48"
        }`}>
          {label}
        </p>
        <span className={`material-symbols-outlined text-[20px] p-2 rounded-full transition-colors ${
          isUrgentActive ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white" : "bg-black/[0.03] text-ink-muted-48 group-hover:bg-action group-hover:text-white"
        }`}>
          {icon}
        </span>
      </div>
      
      <p className={`text-4xl font-bold tabular-nums tracking-tight ${isUrgentActive ? "text-red-700" : "text-ink"}`}>
        {value}
      </p>
      {detail && <p className="text-[13px] text-ink-muted-80 mt-3 font-medium capitalize">{detail}</p>}
      
      {/* Decorative background glow for urgent items */}
      {isUrgentActive && (
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-500/10 blur-2xl rounded-full pointer-events-none" />
      )}
    </Link>
  );
}

export default function SuperadminDashboard({ loaderData }: Route.ComponentProps) {
  const { usersByRole } = loaderData;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Dashboard</h1>
        <p className="text-base text-ink-muted-80">Here&apos;s what needs your attention today.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-2">
        <Link
          to="/superadmin/users/new"
          className="flex items-center gap-2 rounded-xl bg-white border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-action hover:text-action hover:shadow-sm transition-all active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] text-action transition-transform group-hover:scale-110">person_add</span>
          Add User
        </Link>
        <Link
          to="/agreements/new"
          className="flex items-center gap-2 rounded-xl bg-white border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-action hover:text-action hover:shadow-sm transition-all active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] text-action transition-transform group-hover:scale-110">history_edu</span>
          New Agreement
        </Link>
        <Link
          to="/cars/new"
          className="flex items-center gap-2 rounded-xl bg-white border border-hairline px-5 py-2.5 text-sm font-medium text-ink hover:border-action hover:text-action hover:shadow-sm transition-all active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] text-action transition-transform group-hover:scale-110">directions_car</span>
          Add Car
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
        <StatTile
          to="/cars"
          label="Overdue payments"
          value={loaderData.overduePayments}
          detail="Payments marked red"
          icon="warning"
          urgent
        />
        <StatTile
          to="/superadmin/dealer-stock-requests"
          label="Stock requests"
          value={loaderData.openStockRequests}
          icon="inventory_2"
        />
        <StatTile 
          to="/superadmin/requirements" 
          label="Car requirements" 
          value={loaderData.openRequirements} 
          icon="manage_search" 
        />
        <StatTile
          to="/superadmin/dealer-applications"
          label="Dealer applications"
          value={loaderData.dealerApplications}
          icon="storefront"
        />
        <StatTile 
          to="/cars" 
          label="Cars on lease" 
          value={loaderData.totalCars} 
          icon="key" 
        />
        <StatTile
          to="/superadmin/users"
          label="Total users"
          value={loaderData.totalUsers}
          detail={roles.map((r) => `${usersByRole[r]} ${r}`).join(" · ")}
          icon="group"
        />
      </div>

      <div className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6 glass-card mt-2">
        <h2 className="text-xl font-semibold text-ink mb-6 flex items-center gap-2 border-b border-hairline pb-4">
          <span className="material-symbols-outlined text-action">notifications_active</span>
          Notifications
        </h2>
        <NotificationsPanel rows={loaderData.notifications} formAction="?index" />
      </div>
    </div>
  );
}
