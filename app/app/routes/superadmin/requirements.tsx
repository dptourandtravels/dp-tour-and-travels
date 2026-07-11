import { data, Form } from "react-router";
import type { Route } from "./+types/requirements";
import { requireUser } from "../../lib/auth.server";
import { listAllCarRequirements, createCarRequirement, closeCarRequirement } from "../../lib/requirements.server";

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
  await createCarRequirement(title, description, color, quantity);
  return data({ success: true as const });
}

export default function Requirements({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8">
      <Form method="post" className="flex flex-col gap-4 max-w-sm">
        <h2 className="font-semibold">Add requirement</h2>
        <input name="title" placeholder="Vehicle model (e.g. Maruti Suzuki Brezza)" required className="border rounded px-3 py-2" />
        <input name="color" placeholder="Color (optional)" className="border rounded px-3 py-2" />
        <input name="quantity" type="number" min="1" placeholder="Qty required (optional)" className="border rounded px-3 py-2" />
        <textarea name="description" placeholder="Description (optional)" className="border rounded px-3 py-2" />
        {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2 w-fit">
          Add
        </button>
      </Form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Vehicle model &amp; color</th>
            <th className="py-2">Qty required</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {loaderData.requirements.map((r) => (
            <tr key={r.id} className="border-b align-top">
              <td className="py-2">
                {r.title}
                {r.color && ` — ${r.color}`}
                {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
              </td>
              <td className="py-2">{r.quantity ?? "—"}</td>
              <td className="py-2">{r.status}</td>
              <td className="py-2">
                {r.status === "open" && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="close" />
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-xs underline">
                      Close
                    </button>
                  </Form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
