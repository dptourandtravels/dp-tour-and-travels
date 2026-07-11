import { data, Form } from "react-router";
import type { Route } from "./+types/agreements.new";
import { requireUser } from "../lib/auth.server";
import { listCarsForAgreements, buildAgreementFields, confirmAgreement } from "../lib/agreements.server";
import { renderAgreementPdf } from "../lib/agreements";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["finance", "superadmin"]);
  const cars = await listCarsForAgreements();
  return { cars };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["finance", "superadmin"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const carId = String(form.get("carId") ?? "");
  const rate = Number(form.get("rate"));
  const aadhaarUid = String(form.get("aadhaarUid") ?? "").trim();

  if (!carId || !Number.isFinite(rate) || rate <= 0 || !aadhaarUid) {
    return data({ error: "Select a car and fill rate + Aadhaar UID." }, { status: 400 });
  }

  const built = await buildAgreementFields(carId, rate, aadhaarUid);
  if (!built) {
    return data({ error: "Car not found." }, { status: 400 });
  }

  if (intent === "confirm") {
    await confirmAgreement(built, actor.id);
    return data({ confirmed: true as const });
  }

  const pdfBytes = await renderAgreementPdf(built.fields);
  const pdfBase64 = toBase64(pdfBytes);
  return data({ preview: { carId: built.carId, fields: built.fields, pdfBase64 } });
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export default function NewAgreement({ loaderData, actionData }: Route.ComponentProps) {
  if (actionData && "confirmed" in actionData) {
    return <p>Agreement issued and the client has been notified.</p>;
  }

  if (actionData && "preview" in actionData) {
    const { carId, fields, pdfBase64 } = actionData.preview;
    const dataUrl = `data:application/pdf;base64,${pdfBase64}`;
    return (
      <div className="flex flex-col gap-4">
        <iframe src={dataUrl} className="w-full h-[600px] border" title="Agreement preview" />
        <a href={dataUrl} download="agreement.pdf" className="underline text-sm w-fit">
          Download PDF
        </a>
        <Form method="post">
          <input type="hidden" name="intent" value="confirm" />
          <input type="hidden" name="carId" value={carId} />
          <input type="hidden" name="rate" value={fields.rate} />
          <input type="hidden" name="aadhaarUid" value={fields.aadhaarUid} />
          <button type="submit" className="bg-black text-white rounded px-3 py-2">
            Confirm &amp; issue
          </button>
        </Form>
      </div>
    );
  }

  return (
    <main className="max-w-sm mx-auto pt-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">New agreement</h1>
      <Form method="post" className="flex flex-col gap-4">
        <select name="carId" required className="border rounded px-3 py-2">
          <option value="">Select car</option>
          {loaderData.cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model} — {c.registrationNumber} — {c.ownerName}
            </option>
          ))}
        </select>
        <input
          name="rate"
          type="number"
          min="1"
          placeholder="Rate (₹/month)"
          required
          className="border rounded px-3 py-2"
        />
        <input name="aadhaarUid" placeholder="Aadhaar UID" required className="border rounded px-3 py-2" />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Preview
        </button>
      </Form>
    </main>
  );
}
