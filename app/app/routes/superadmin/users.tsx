import { desc, eq } from "drizzle-orm";
import { data, Form } from "react-router";
import type { Route } from "./+types/users";
import { requireUser, db, updateUserRole, publicUserColumns } from "../../lib/auth.server";
import { users, roles, type Role } from "../../db/schema";
import { logAudit } from "../../lib/audit.server";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

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

function UserRow({ user, availableRoles }: { user: any, availableRoles: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Form method="post" className="flex items-center gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="role" value={selectedRole} />
          
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-36 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 transition-all"
            >
              <span className="block truncate capitalize">{selectedRole}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </span>
            </button>

            {isOpen && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {availableRoles.map((r) => (
                  <li
                    key={r}
                    className={`relative cursor-default select-none py-2 pl-3 pr-9 ${
                      selectedRole === r ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setSelectedRole(r);
                      setIsOpen(false);
                    }}
                  >
                    <span className="block truncate capitalize">{r}</span>
                    {selectedRole === r && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
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
  );
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
              <UserRow key={u.id} user={u} availableRoles={roles} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
