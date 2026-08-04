import { data, Form } from "react-router";
import type { Route } from "./+types/users.bulk";
import { requireUser, createStaffUser } from "../../lib/auth.server";

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const [header, ...rows] = lines;
  const columns = header.split(",").map((c) => c.trim().toLowerCase());
  return rows.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(columns.map((col, i) => [col, cells[i] ?? ""]));
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request, ["superadmin"]);

  const form = await request.formData();
  const file = form.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    return data({ error: "Choose a CSV file (columns: email,name,role)." }, { status: 400 });
  }

  const rows = parseCsv(await file.text());
  const created: { email: string; password: string }[] = [];
  const skipped: { email: string; reason: string }[] = [];

  for (const row of rows) {
    const result = await createStaffUser({
      email: row.email ?? "",
      name: row.name ?? "",
      role: (row.role ?? "") as "superadmin" | "finance",
    });
    if ("error" in result) {
      skipped.push({ email: row.email || "(blank)", reason: result.error });
    } else {
      created.push(result);
    }
  }

  return data({ created, skipped });
}

export default function BulkImportUsers({ actionData }: Route.ComponentProps) {
  return (
    <div className="p-8">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Bulk import users</h1>
        <p className="text-gray-600 mb-8 text-sm">Upload a CSV file to add multiple staff members at once.</p>
        
        <Form method="post" encType="multipart/form-data" className="flex flex-col gap-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload CSV</label>
            <p className="text-sm text-gray-500 mb-4">
              File must include a header row: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">email,name,role</code> (role is <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">superadmin</code> or <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">finance</code>).
            </p>
            <input 
              name="csv" 
              type="file" 
              accept=".csv,text/csv" 
              required 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          
          {actionData && "error" in actionData && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm font-medium">{actionData.error}</p>
            </div>
          )}
          
          <div className="pt-2">
            <button type="submit" className="bg-black text-white font-medium rounded-md px-6 py-2.5 text-sm hover:bg-gray-800 transition-colors shadow-sm">
              Import users
            </button>
          </div>
        </Form>

        {actionData && "created" in actionData && actionData.created.length > 0 && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-green-900 mb-1">Accounts Created</h3>
            <p className="text-green-800 text-sm mb-4">Share these credentials now — passwords won't be shown again:</p>
            <div className="space-y-2">
              {actionData.created.map((c) => (
                <div key={c.email} className="flex justify-between items-center bg-white border border-green-100 p-3 rounded shadow-sm">
                  <span className="text-gray-600 text-sm">{c.email}</span> 
                  <strong className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 text-sm">{c.password}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionData && "skipped" in actionData && actionData.skipped.length > 0 && (
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-amber-900 mb-3">Skipped Rows</h3>
            <ul className="text-sm space-y-2">
              {actionData.skipped.map((s) => (
                <li key={s.email} className="flex items-start text-amber-800">
                  <span className="font-medium mr-2">{s.email}:</span>
                  <span>{s.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
