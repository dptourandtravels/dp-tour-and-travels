import type { Route } from "./+types/client.agreements";
import { requireUser } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { listAgreementsForParty } from "../lib/agreements.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client", "user"]);
  const agreements = await listAgreementsForParty(user.id);
  return { user, agreements };
}

export default function ClientAgreements({ loaderData }: Route.ComponentProps) {
  const { user, agreements } = loaderData;

  return (
    <SidebarShell user={user} navGroups={getNavGroups("client")}>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <div className="mb-8 border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Agreements</h1>
          <p className="text-base text-ink-muted-80">Agreements issued for your cars.</p>
        </div>

        {agreements.length === 0 ? (
          <div className="bg-surface-pearl border border-hairline rounded-2xl p-10 text-center soft-shadow flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-ink-muted-48 text-5xl mb-3">draft</span>
            <p className="text-ink-muted-80 font-medium">No agreements issued yet.</p>
          </div>
        ) : (
          <div className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow overflow-hidden">
            <ul className="flex flex-col divide-y divide-hairline">
              {agreements.map((a) => (
                <li key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-black/[0.015] transition-colors">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="w-11 h-11 rounded-full bg-blue-50 text-action border border-blue-100 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">contract</span>
                    </div>
                    <div>
                      <span className="text-ink font-medium block text-[15px]">{a.carDescription}</span>
                      <span className="text-xs font-mono bg-black/5 px-1.5 py-0.5 rounded text-ink-muted-80 mt-1 inline-block">{a.registrationNumber}</span>
                    </div>
                  </div>
                  <a
                    href={`/agreements/${a.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-action hover:bg-action/10 px-4 py-2 rounded-lg transition-colors self-end sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span> Download PDF
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SidebarShell>
  );
}
