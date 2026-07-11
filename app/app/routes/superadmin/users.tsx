import { desc, eq } from "drizzle-orm";
import { data, Form } from "react-router";
import type { Route } from "./+types/users";
import { requireUser, db, updateUserRole } from "../../lib/auth.server";
import { users, roles, type Role } from "../../db/schema";
import { logAudit } from "../../lib/audit.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return { users: rows };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireUser(request, ["superadmin"]);
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const role = String(form.get("role") ?? "") as Role;

  if (!userId || !roles.includes(role)) {
    return data({ error: "Invalid user or role." }, { status: 400 });
  }

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return data({ error: "User not found." }, { status: 404 });

  if (target.role !== role) {
    await updateUserRole(userId, role);
    await logAudit({
      entityType: "user",
      entityId: userId,
      action: "role_change",
      actorUserId: actor.id,
      before: { role: target.role },
      after: { role },
    });
  }

  return data({ success: true as const });
}

export default function UsersList({ loaderData }: Route.ComponentProps) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="py-2">Name</th>
          <th className="py-2">Email</th>
          <th className="py-2">Role</th>
        </tr>
      </thead>
      <tbody>
        {loaderData.users.map((u) => (
          <tr key={u.id} className="border-b">
            <td className="py-2">{u.name}</td>
            <td className="py-2">{u.email}</td>
            <td className="py-2">
              <Form method="post" className="flex items-center gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <select name="role" defaultValue={u.role} className="border rounded px-2 py-1">
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button type="submit" className="text-xs underline">
                  Save
                </button>
              </Form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
