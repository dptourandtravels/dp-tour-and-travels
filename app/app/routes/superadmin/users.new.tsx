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
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Account Created</h1>
        <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-6">
          <p className="mb-4 text-green-800 dark:text-green-200 font-medium">Share these credentials with the user now — the password won't be shown again:</p>
          <div className="space-y-2">
            <p className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Email:</span> <strong className="font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">{actionData.created.email}</strong></p>
            <p className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Password:</span> <strong className="font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded">{actionData.created.password}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Create new account</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Add a new staff member to the system.</p>
        
        <Form method="post" className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
            <input id="name" name="name" placeholder="John Doe" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent shadow-sm" />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input id="email" name="email" type="email" placeholder="john@example.com" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent shadow-sm" />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select id="role" name="role" required defaultValue="" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent shadow-sm">
              <option value="" disabled>Select a role...</option>
              <option value="superadmin">Superadmin</option>
              <option value="finance">Finance</option>
            </select>
          </div>
          
          {actionData && "error" in actionData && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md mt-2">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{actionData.error}</p>
            </div>
          )}
          
          <div className="pt-4">
            <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-medium rounded-md px-4 py-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
              Create account
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
