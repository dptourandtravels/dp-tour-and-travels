import { data, Form } from "react-router";
import type { Route } from "./+types/agreements.new";
import { requireUser } from "../lib/auth.server";
import { listCarsForAgreements, buildAgreementFields, confirmAgreement } from "../lib/agreements.server";
import { renderAgreementPdf } from "../lib/agreements";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import type { Role } from "../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const cars = await listCarsForAgreements();
  return { cars, actor };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const carId = String(form.get("carId") ?? "");
  const rate = Number(form.get("rate"));
  const aadhaarUid = String(form.get("aadhaarUid") ?? "").trim();
  const party = form.get("party") === "dealer" ? ("dealer" as const) : ("client" as const);

  if (!carId || !Number.isFinite(rate) || rate <= 0 || !aadhaarUid) {
    return data({ error: "Select a car and fill rate + Aadhaar UID." }, { status: 400 });
  }

  const built = await buildAgreementFields(carId, rate, aadhaarUid, party);
  if (!built) {
    return data({ error: "Car not found, or no dealer is assigned to it." }, { status: 400 });
  }

  if (intent === "confirm") {
    await confirmAgreement(built, actor.id);
    return data({ confirmed: true as const });
  }

  const pdfBytes = await renderAgreementPdf(built.fields);
  const pdfBase64 = toBase64(pdfBytes);
  return data({ preview: { carId: built.carId, party, fields: built.fields, pdfBase64 } });
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

const fieldClass =
  "border border-hairline rounded-lg px-3 py-2 text-sm text-ink bg-surface-pearl focus:outline-none focus:ring-2 focus:ring-action/40 focus:border-action";
const buttonClass =
  "bg-action text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-action-focus transition-colors";

export default function NewAgreement({ loaderData, actionData }: Route.ComponentProps) {
  const shellProps = { user: loaderData.actor, navGroups: getNavGroups(loaderData.actor.role as Role) };

  if (actionData && "confirmed" in actionData) {
    return (
      <SidebarShell {...shellProps}>
        <h1 className="text-2xl font-semibold mb-6 text-ink">New agreement</h1>
        <p className="text-sm text-ink-muted-80">Agreement issued and the recipient has been notified.</p>
      </SidebarShell>
    );
  }

  if (actionData && "preview" in actionData) {
    const { carId, party, fields, pdfBase64 } = actionData.preview;
    const dataUrl = `data:application/pdf;base64,${pdfBase64}`;
    return (
      <SidebarShell {...shellProps}>
        <h1 className="text-2xl font-semibold mb-6 text-ink">New agreement</h1>
        <div className="flex flex-col gap-4">
          <iframe
            src={dataUrl}
            className="w-full h-[600px] rounded-lg border border-hairline"
            title="Agreement preview"
          />
          <a href={dataUrl} download="agreement.pdf" className="text-sm text-action hover:underline w-fit">
            Download PDF
          </a>
          <Form method="post">
            <input type="hidden" name="intent" value="confirm" />
            <input type="hidden" name="carId" value={carId} />
            <input type="hidden" name="party" value={party} />
            <input type="hidden" name="rate" value={fields.rate} />
            <input type="hidden" name="aadhaarUid" value={fields.aadhaarUid} />
            <button type="submit" className={buttonClass}>
              Confirm &amp; issue
            </button>
          </Form>
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell {...shellProps}>
      <h1 className="text-2xl font-semibold mb-6 text-ink">New agreement</h1>
      <Form method="post" className="flex flex-col gap-4 max-w-sm">
        <select name="carId" required className={fieldClass}>
          <option value="">Select car</option>
          {loaderData.cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model} — {c.registrationNumber} — Owner: {c.ownerName}
              {c.dealerName ? ` — Dealer: ${c.dealerName}` : ""}
            </option>
          ))}
        </select>
        <select name="party" required className={fieldClass}>
          <option value="client">Issue to: Client (owner)</option>
          <option value="dealer">Issue to: Assigned dealer</option>
        </select>
        <input name="rate" type="number" min="1" placeholder="Rate (₹/month)" required className={fieldClass} />
        <input name="aadhaarUid" placeholder="Aadhaar UID" required className={fieldClass} />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className={buttonClass}>
          Preview
        </button>
      </Form>
    </SidebarShell>
  );
}
