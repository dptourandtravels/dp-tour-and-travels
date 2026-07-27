import { eq } from "drizzle-orm";
import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { requireUser, db } from "../../lib/auth.server";
import { users, cars, payments, carRequirements, dealerApplications, dealerStockRequests, roles, type Role } from "../../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);

  const [allUsers, allCars, overduePayments, openRequirements, applications, openStockRequests] = await Promise.all([
    db.select({ role: users.role }).from(users),
    db.select({ id: cars.id }).from(cars),
    db.select({ id: payments.id }).from(payments).where(eq(payments.status, "red")),
    db.select({ id: carRequirements.id }).from(carRequirements).where(eq(carRequirements.status, "open")),
    db.select({ id: dealerApplications.id }).from(dealerApplications),
    db.select({ id: dealerStockRequests.id }).from(dealerStockRequests).where(eq(dealerStockRequests.status, "open")),
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
  };
}

function StatTile({
  to,
  label,
  value,
  detail,
  urgent,
}: {
  to: string;
  label: string;
  value: number;
  detail?: string;
  urgent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group block rounded-[18px] border p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${
        urgent && value > 0
          ? "border-red-200 bg-red-50 hover:border-red-300"
          : "border-hairline bg-surface-pearl hover:border-action/40"
      }`}
    >
      <p
        className={`text-label-sm uppercase tracking-wide mb-3 ${
          urgent && value > 0 ? "text-red-700/70" : "text-ink-muted-48"
        }`}
      >
        {label}
      </p>
      <p className={`text-3xl font-semibold tabular-nums ${urgent && value > 0 ? "text-red-700" : "text-ink"}`}>
        {value}
      </p>
      {detail && <p className="text-xs text-ink-muted-48 mt-2">{detail}</p>}
    </Link>
  );
}

export default function SuperadminDashboard({ loaderData }: Route.ComponentProps) {
  const { usersByRole } = loaderData;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-1">Dashboard</h1>
        <p className="text-body-apple text-ink-muted-80">Here&apos;s what needs your attention.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/superadmin/users/new"
          className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:border-action hover:text-action transition-colors"
        >
          Add user
        </Link>
        <Link
          to="/agreements/new"
          className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:border-action hover:text-action transition-colors"
        >
          New agreement
        </Link>
        <Link
          to="/cars/new"
          className="rounded-full border border-hairline px-4 py-2 text-sm text-ink hover:border-action hover:text-action transition-colors"
        >
          Add car
        </Link>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatTile
          to="/cars"
          label="Overdue payments"
          value={loaderData.overduePayments}
          detail="Payments marked red"
          urgent
        />
        <StatTile
          to="/superadmin/dealer-stock-requests"
          label="Pending stock requests"
          value={loaderData.openStockRequests}
        />
        <StatTile to="/superadmin/requirements" label="Open car requirements" value={loaderData.openRequirements} />
        <StatTile
          to="/superadmin/dealer-applications"
          label="Dealer applications"
          value={loaderData.dealerApplications}
        />
        <StatTile to="/cars" label="Cars on lease" value={loaderData.totalCars} />
        <StatTile
          to="/superadmin/users"
          label="Total users"
          value={loaderData.totalUsers}
          detail={roles.map((r) => `${usersByRole[r]} ${r}`).join(" · ")}
        />
      </div>
    </div>
  );
}
