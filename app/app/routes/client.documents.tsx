import { data, Form, useSubmit } from "react-router";
import type { Route } from "./+types/client.documents";
import { requireUser } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";
import { listDocumentsForClient, uploadDocument } from "../lib/documents.server";
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
  const user = await requireUser(request, ["client", "user"]);
  const documents = await listDocumentsForClient(user.id);
  return { user, documents };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request, ["client", "user"]);
  const form = await request.formData();
  const docType = String(form.get("docType") ?? "");
  const file = form.get("file");

  if (!documentTypes.includes(docType as DocumentType) || !(file instanceof File) || file.size === 0) {
    return data({ error: "Select a valid file to upload." }, { status: 400 });
  }

  await uploadDocument(user.id, docType as DocumentType, file);
  return data({ success: true as const });
}

export default function ClientDocuments({ loaderData, actionData }: Route.ComponentProps) {
  const { user, documents } = loaderData;
  const submit = useSubmit();

  return (
    <SidebarShell user={user} navGroups={getNavGroups("client")}>
      <div className="max-w-4xl mx-auto w-full pb-12">
        <div className="mb-8 border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Documents</h1>
          <p className="text-base text-ink-muted-80">Upload the documents required for your account.</p>
        </div>

        {actionData && "error" in actionData && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2 soft-shadow">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            {actionData.error}
          </div>
        )}
        <div className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow overflow-hidden">
          <ul className="flex flex-col divide-y divide-hairline">
            {documents.map(({ type, doc }) => (
              <li key={type} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-black/[0.015] transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm ${doc ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    <span className="material-symbols-outlined text-[22px]">
                      {doc ? 'check_circle' : 'description'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink font-medium block text-[15px]">{docLabels[type]}</span>
                    <span className="text-xs text-ink-muted-48">{doc ? 'Uploaded successfully' : 'Missing required document'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {doc && (
                    <a
                      href={`/client/documents/${type}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-action hover:bg-action/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span> View
                    </a>
                  )}
                  <Form method="post" encType="multipart/form-data" className="flex items-center">
                    <input type="hidden" name="docType" value={type} />
                    <label className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-white bg-action hover:bg-action-focus px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm hover:shadow group">
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-y-0.5">
                        {doc ? 'sync' : 'upload'}
                      </span>
                      {doc ? "Replace" : "Upload"}
                      <input
                        type="file"
                        name="file"
                        required
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            submit(e.currentTarget.form);
                          }
                        }}
                      />
                    </label>
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SidebarShell>
  );
}
