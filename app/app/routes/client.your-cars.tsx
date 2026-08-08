import type { Route } from "./+types/client.your-cars";
import { requireUser } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { listCarsForClient } from "../lib/cars.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client", "user"]);
  const cars = await listCarsForClient(user.id);
  return { user, cars };
}

export default function ClientYourCars({ loaderData }: Route.ComponentProps) {
  const { user, cars } = loaderData;

  return (
    <SidebarShell user={user} navGroups={getNavGroups("client")}>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <div className="mb-8 border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Your Cars</h1>
          <p className="text-base text-ink-muted-80">Cars registered to your account and their payment status.</p>
        </div>

        {cars.length === 0 ? (
          <div className="bg-surface-pearl border border-hairline rounded-2xl p-10 text-center soft-shadow flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-ink-muted-48 text-5xl mb-3">airport_shuttle</span>
            <p className="text-ink-muted-80 font-medium">No cars registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cars.map(({ car, payment }) => (
              <div key={car.id} className="glass-card rounded-2xl p-6 soft-shadow flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 border border-hairline/60">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-ink">{car.make} {car.model}</h3>
                    {payment.status === "green" ? (
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium border border-green-100">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Good
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium border border-red-100">
                        <span className="material-symbols-outlined text-[16px]">error</span> Overdue
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-mono text-ink-muted-80 bg-black/5 px-2.5 py-1 rounded-md w-fit mb-6 tracking-wide">{car.registrationNumber}</p>
                </div>
                <div className="text-xs text-ink-muted-48 flex justify-between items-end border-t border-hairline pt-4 mt-2">
                  <div>
                    <p className="mb-0.5">Registered</p>
                    <p className="font-medium text-ink-muted-80">{new Date(car.receiptDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-0.5">Payment Method</p>
                    <p className="font-medium text-ink-muted-80">{payment.method ?? "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarShell>
  );
}
