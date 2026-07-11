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
    <div className="flex flex-col gap-6 max-w-lg">
      <Form method="post" encType="multipart/form-data" className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CSV with header row: <code>email,name,role</code> (role is <code>superadmin</code> or{" "}
          <code>finance</code>).
        </p>
        <input name="csv" type="file" accept=".csv,text/csv" required />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2 w-fit">
          Import
        </button>
      </Form>

      {actionData && "created" in actionData && actionData.created.length > 0 && (
        <div>
          <p className="mb-2">Created — share these passwords now, they won't be shown again:</p>
          <ul className="font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 space-y-1">
            {actionData.created.map((c) => (
              <li key={c.email}>
                {c.email} / {c.password}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionData && "skipped" in actionData && actionData.skipped.length > 0 && (
        <div>
          <p className="mb-2">Skipped:</p>
          <ul className="text-sm text-red-600 space-y-1">
            {actionData.skipped.map((s) => (
              <li key={s.email}>
                {s.email} — {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
