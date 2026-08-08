import { desc, eq } from "drizzle-orm";
import { data, Form } from "react-router";
import type { Route } from "./+types/users";
import { requireUser, db, updateUserRole, publicUserColumns } from "../../lib/auth.server";
import { users, roles, type Role } from "../../db/schema";
import { logAudit } from "../../lib/audit.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const rows = await db.select(publicUserColumns).from(users).orderBy(desc(users.createdAt));
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
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Manage Users</h2>
        <p className="text-sm text-gray-500">Update roles for all registered users in the system.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loaderData.users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {u.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Form method="post" className="flex items-center gap-3">
                    <input type="hidden" name="userId" value={u.id} />
                    <div className="relative">
                      <select 
                        name="role" 
                        defaultValue={u.role} 
                        className="block w-36 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 bg-white shadow-sm appearance-none cursor-pointer"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-colors"
                    >
                      Save
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
