import { data, Form } from "react-router";
import type { Route } from "./+types/requirements";
import { requireUser } from "../../lib/auth.server";
import {
  listAllCarRequirements,
  createCarRequirement,
  closeCarRequirement,
  reopenCarRequirement,
  updateCarRequirement,
} from "../../lib/requirements.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const requirements = await listAllCarRequirements();
  return { requirements };
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request, ["superadmin"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "close") {
    await closeCarRequirement(String(form.get("id") ?? ""));
    return data({ success: true as const });
  }

  if (intent === "reopen") {
    await reopenCarRequirement(String(form.get("id") ?? ""));
    return data({ success: true as const });
  }

  // "create" and "edit" take the same fields, so they share the parsing and validation below.
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "");
  const color = String(form.get("color") ?? "").trim();
  const quantityRaw = String(form.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  if (!title) {
    return data({ error: "Title is required." }, { status: 400 });
  }
  if (quantityRaw && (!Number.isInteger(quantity) || quantity! <= 0)) {
    return data({ error: "Quantity must be a positive whole number." }, { status: 400 });
  }
  if (intent === "edit") {
    await updateCarRequirement(String(form.get("id") ?? ""), title, description, color, quantity);
    return data({ success: true as const });
  }

  await createCarRequirement(title, description, color, quantity);
  return data({ success: true as const });
}

export default function Requirements({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8">
      <Form method="post" className="flex flex-col gap-4 max-w-sm">
        <h2 className="font-semibold">Add requirement</h2>
        <input name="title" placeholder="Vehicle model (e.g. Maruti Suzuki Brezza)" required className="border border-hairline bg-white rounded-lg px-3 py-2 outline-none focus:border-action transition-colors" />
        <input name="color" placeholder="Color (optional)" className="border border-hairline bg-white rounded-lg px-3 py-2 outline-none focus:border-action transition-colors" />
        <input name="quantity" type="number" min="1" placeholder="Qty required (optional)" className="border border-hairline bg-white rounded-lg px-3 py-2 outline-none focus:border-action transition-colors" />
        <textarea name="description" placeholder="Description (optional)" className="border border-hairline bg-white rounded-lg px-3 py-2 outline-none focus:border-action transition-colors min-h-[100px]" />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-action text-white rounded-lg px-4 py-2 w-fit font-medium hover:bg-action-focus transition-colors">
          Add
        </button>
      </Form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-hairline">
            <th className="py-2">Vehicle model &amp; color</th>
            <th className="py-2">Qty required</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {loaderData.requirements.map((r) => (
            <tr key={r.id} className="border-b border-hairline align-top">
              <td className="py-2">
                {r.title}
                {r.color && ` — ${r.color}`}
                {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
              </td>
              <td className="py-2">{r.quantity ?? "—"}</td>
              <td className="py-2">{r.status}</td>
              <td className="py-2">
                <div className="flex items-start gap-6">
                  <Form method="post" className="flex items-center" title={r.status === "open" ? "Close requirement" : "Reopen requirement"}>
                    <input type="hidden" name="intent" value={r.status === "open" ? "close" : "reopen"} />
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      role="switch"
                      aria-checked={r.status === "open"}
                      className={`${
                        r.status === "open" ? "bg-action" : "bg-gray-300"
                      } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2`}
                    >
                      <span className="sr-only">Toggle status</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          r.status === "open" ? "translate-x-4" : "translate-x-0"
                        } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </Form>

                  <details className="mt-0.5">
                    <summary className="text-xs underline cursor-pointer text-gray-600 hover:text-black transition-colors">Edit</summary>
                    <Form method="post" className="flex flex-col gap-2 mt-2 min-w-[220px]">
                      <input type="hidden" name="intent" value="edit" />
                      <input type="hidden" name="id" value={r.id} />
                      <input name="title" defaultValue={r.title} required className="text-xs border border-hairline bg-white rounded px-2 py-1 outline-none focus:border-action transition-colors" />
                      <input name="color" defaultValue={r.color ?? ""} placeholder="Color (optional)" className="text-xs border border-hairline bg-white rounded px-2 py-1 outline-none focus:border-action transition-colors" />
                      <input name="quantity" type="number" min="1" defaultValue={r.quantity ?? ""} placeholder="Qty (optional)" className="text-xs border border-hairline bg-white rounded px-2 py-1 outline-none focus:border-action transition-colors" />
                      <textarea name="description" defaultValue={r.description ?? ""} placeholder="Description (optional)" className="text-xs border border-hairline bg-white rounded px-2 py-1 outline-none focus:border-action transition-colors min-h-[60px]" />
                      <button type="submit" className="bg-action text-white rounded px-3 py-1 text-xs w-fit font-medium hover:bg-action-focus transition-colors">
                        Save
                      </button>
                    </Form>
                  </details>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
