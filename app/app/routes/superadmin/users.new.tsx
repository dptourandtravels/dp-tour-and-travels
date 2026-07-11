import { data, Form } from "react-router";
import type { Route } from "./+types/users.new";
import { requireUser, createStaffUser } from "../../lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request, ["superadmin"]);

  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const name = String(form.get("name") ?? "");
  const role = String(form.get("role") ?? "");

  const result = await createStaffUser({ email, name, role: role as "superadmin" | "finance" });
  if ("error" in result) {
    return data({ error: result.error }, { status: 400 });
  }
  return data({ created: result });
}

export default function NewUser({ actionData }: Route.ComponentProps) {
  if (actionData && "created" in actionData) {
    return (
      <div>
        <p className="mb-2">Account created. Share this password with the user now — it won't be shown again:</p>
        <p className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 inline-block">
          {actionData.created.email} / {actionData.created.password}
        </p>
      </div>
    );
  }

  return (
    <Form method="post" className="flex flex-col gap-4 max-w-sm">
      <input name="name" placeholder="Full name" required className="border rounded px-3 py-2" />
      <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
      <select name="role" required className="border rounded px-3 py-2">
        <option value="">Select role</option>
        <option value="superadmin">Superadmin</option>
        <option value="finance">Finance</option>
      </select>
      {actionData && "error" in actionData && <p className="text-red-600 text-sm">{actionData.error}</p>}
      <button type="submit" className="bg-black text-white rounded px-3 py-2">
        Create account
      </button>
    </Form>
  );
}
