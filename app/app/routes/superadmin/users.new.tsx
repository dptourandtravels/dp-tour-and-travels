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
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Account Created</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="mb-4 text-green-800 font-medium">Share these credentials with the user now — the password won't be shown again:</p>
          <div className="space-y-2">
            <p className="flex justify-between items-center"><span className="text-gray-600">Email:</span> <strong className="font-mono bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded">{actionData.created.email}</strong></p>
            <p className="flex justify-between items-center"><span className="text-gray-600">Password:</span> <strong className="font-mono bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded">{actionData.created.password}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Create new account</h1>
        <p className="text-gray-600 mb-8 text-sm">Add a new staff member to the system.</p>
        
        <Form method="post" className="flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full name</label>
            <input id="name" name="name" placeholder="Rahul Sharma" required className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email address</label>
            <input id="email" name="email" type="email" placeholder="rahul@example.com" required className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Role</label>
            <select id="role" name="role" required defaultValue="" className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none">
              <option value="" disabled>Select a role...</option>
              <option value="superadmin">Superadmin</option>
              <option value="finance">Finance</option>
            </select>
          </div>
          
          {actionData && "error" in actionData && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-2">
              <p className="text-red-600 text-sm font-medium">{actionData.error}</p>
            </div>
          )}
          
          <div className="pt-4">
            <button type="submit" className="w-full bg-black text-white font-medium rounded-md px-4 py-3 text-base hover:bg-gray-800 transition-colors shadow-sm">
              Create account
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
