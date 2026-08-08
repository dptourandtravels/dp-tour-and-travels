import { Link } from "react-router";
import type { Route } from "./+types/client";
import { requireUser } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { listCarsForClient } from "../lib/cars.server";
import { listDocumentsForClient } from "../lib/documents.server";
import { listAgreementsForParty } from "../lib/agreements.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client", "user"]);
  const [cars, documents, agreements] = await Promise.all([
    listCarsForClient(user.id),
    listDocumentsForClient(user.id),
    listAgreementsForParty(user.id),
  ]);
  const documentsUploaded = documents.filter(({ doc }) => doc).length;
  return {
    user,
    carsCount: cars.length,
    documentsUploaded,
    documentsTotal: documents.length,
    agreementsCount: agreements.length,
  };
}

export default function ClientDashboard({ loaderData }: Route.ComponentProps) {
  const { user, carsCount, documentsUploaded, documentsTotal, agreementsCount } = loaderData;

  const tiles = [
    {
      to: "/client/your-cars",
      icon: "directions_car",
      label: "Your Cars",
      value: String(carsCount),
      hint: carsCount === 1 ? "car registered" : "cars registered",
    },
    {
      to: "/client/documents",
      icon: "folder_open",
      label: "Documents",
      value: `${documentsUploaded}/${documentsTotal}`,
      hint: "uploaded",
    },
    {
      to: "/client/agreements",
      icon: "handshake",
      label: "Agreements",
      value: String(agreementsCount),
      hint: agreementsCount === 1 ? "agreement issued" : "agreements issued",
    },
  ];

  return (
    <SidebarShell user={user} navGroups={getNavGroups("client")}>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <div className="mb-8 border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Client Dashboard</h1>
          <p className="text-base text-ink-muted-80">Manage your cars, documents, and agreements.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {tiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="glass-card rounded-2xl p-6 soft-shadow flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 border border-hairline/60"
            >
              <span className="material-symbols-outlined text-action text-3xl">{tile.icon}</span>
              <div>
                <p className="text-2xl font-bold text-ink">{tile.value}</p>
                <p className="text-sm text-ink-muted-80">{tile.hint}</p>
              </div>
              <span className="text-sm font-medium text-action mt-auto">{tile.label} →</span>
            </Link>
          ))}
        </div>
      </div>
    </SidebarShell>
  );
}
