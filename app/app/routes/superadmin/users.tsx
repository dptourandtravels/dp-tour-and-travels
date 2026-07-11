import { desc } from "drizzle-orm";
import type { Route } from "./+types/users";
import { requireUser, db } from "../../lib/auth.server";
import { users } from "../../db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request, ["superadmin"]);
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return { users: rows };
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
            <td className="py-2">{u.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
