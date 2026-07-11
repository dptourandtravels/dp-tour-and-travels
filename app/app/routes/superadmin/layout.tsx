import { Form, Link, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser } from "../../lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request, ["superadmin"]);
}

export default function SuperadminLayout({ loaderData }: Route.ComponentProps) {
  return (
    <main className="max-w-2xl mx-auto pt-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Superadmin</h1>
        <Form method="post" action="/logout">
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </Form>
      </div>
      <p className="mb-4">Signed in as {loaderData.name} ({loaderData.email}).</p>
      <nav className="flex flex-wrap gap-4 mb-8 text-sm underline">
        <Link to="/superadmin">Dashboard</Link>
        <Link to="/superadmin/users">Users</Link>
        <Link to="/superadmin/users/new">Add user</Link>
        <Link to="/superadmin/users/bulk">Bulk import</Link>
        <Link to="/cars">Cars &amp; payments</Link>
        <Link to="/agreements/new">New agreement</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/superadmin/requirements">Car requirements</Link>
        <Link to="/superadmin/intake">Intake</Link>
        <Link to="/superadmin/dealer-applications">Dealer applications</Link>
      </nav>
      <Outlet />
    </main>
  );
}
