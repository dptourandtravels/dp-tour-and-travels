import { data, Form } from "react-router";
import type { Route } from "./+types/client";
import { requireUser } from "../lib/auth.server";
import { DashboardShell } from "../components/dashboard-shell";
import { listCarsForClient } from "../lib/cars.server";
import { listDocumentsForClient, uploadDocument } from "../lib/documents.server";
import { listAgreementsForParty } from "../lib/agreements.server";
import { documentTypes, type DocumentType } from "../db/schema";

const docLabels: Record<DocumentType, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN",
  dl: "Driving Licence",
  photo: "Photo",
  rc: "RC",
  plate_photo: "Number Plate Photo",
  signed_agreement: "Signed Agreement",
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client"]);
  const [cars, documents, agreements] = await Promise.all([
    listCarsForClient(user.id),
    listDocumentsForClient(user.id),
    listAgreementsForParty(user.id),
  ]);
  return { user, cars, documents, agreements };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request, ["client"]);
  const form = await request.formData();
  const docType = String(form.get("docType") ?? "");
  const file = form.get("file");

  if (!documentTypes.includes(docType as DocumentType) || !(file instanceof File) || file.size === 0) {
    return data({ error: "Select a file to upload." }, { status: 400 });
  }

  await uploadDocument(user.id, docType as DocumentType, file);
  return data({ success: true as const });
}

export default function ClientDashboard({ loaderData, actionData }: Route.ComponentProps) {
  const { user, cars, documents, agreements } = loaderData;

  return (
    <DashboardShell title="Client dashboard" name={user.name} email={user.email}>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Your cars</h2>
        {cars.length === 0 ? (
          <p className="text-sm text-ink-muted-48">No cars registered yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-hairline text-ink-muted-48">
                <th className="py-2 font-medium">Car</th>
                <th className="py-2 font-medium">Registered on</th>
                <th className="py-2 font-medium">Payment status</th>
                <th className="py-2 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(({ car, payment }) => (
                <tr key={car.id} className="border-b border-hairline text-ink">
                  <td className="py-2">
                    {car.make} {car.model}
                    <br />
                    <span className="text-ink-muted-80">{car.registrationNumber}</span>
                  </td>
                  <td className="py-2">{new Date(car.receiptDate).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={payment.status === "green" ? "text-green-600" : "text-red-600"}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">{payment.method ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Documents</h2>
        {actionData && "error" in actionData && <p className="text-red-600 text-sm mb-2">{actionData.error}</p>}
        <ul className="flex flex-col">
          {documents.map(({ type, doc }) => (
            <li key={type} className="flex items-center justify-between border-b border-hairline py-3">
              <span className="text-ink">{docLabels[type]}</span>
              <div className="flex items-center gap-3">
                {doc && (
                  <a
                    href={`/client/documents/${type}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-action hover:underline"
                  >
                    View
                  </a>
                )}
                <Form method="post" encType="multipart/form-data" className="flex items-center gap-2">
                  <input type="hidden" name="docType" value={type} />
                  <input type="file" name="file" required className="text-xs text-ink-muted-80" />
                  <button type="submit" className="text-xs text-action hover:underline">
                    {doc ? "Replace" : "Upload"}
                  </button>
                </Form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Agreements</h2>
        {agreements.length === 0 ? (
          <p className="text-sm text-ink-muted-48">No agreements issued yet.</p>
        ) : (
          <ul className="flex flex-col">
            {agreements.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-hairline py-3">
                <span className="text-ink">
                  {a.carDescription} — {a.registrationNumber}
                </span>
                <a
                  href={`/agreements/${a.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-action hover:underline"
                >
                  View / Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
