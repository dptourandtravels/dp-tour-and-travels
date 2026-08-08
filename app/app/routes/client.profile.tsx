import { data, Form, useSubmit } from "react-router";
import type { Route } from "./+types/client.profile";
import { requireUser, updateUserProfile, updateUserPassword, uploadProfilePicture } from "../lib/auth.server";
import { SidebarShell } from "../components/sidebar-shell";
import { getNavGroups } from "../lib/admin-nav";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client", "user"]);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request, ["client", "user"]);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "update_info") {
    const result = await updateUserProfile(user.id, {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
    });
    if ("error" in result) {
      const message = result.error === "already exists" ? "That email is already in use." : "Enter a valid name and email.";
      return data({ intent, error: message }, { status: 400 });
    }
    return data({ intent, success: true as const });
  }

  if (intent === "change_password") {
    const result = await updateUserPassword(
      user.id,
      String(form.get("currentPassword") ?? "").trim(),
      String(form.get("newPassword") ?? "").trim(),
    );
    if ("error" in result) {
      return data({ intent, error: result.error }, { status: 400 });
    }
    return data({ intent, success: true as const });
  }

  if (intent === "upload_picture") {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return data({ intent, error: "Select an image to upload." }, { status: 400 });
    }
    await uploadProfilePicture(user.id, file);
    return data({ intent, success: true as const });
  }

  return data({ intent, error: "Unknown action." }, { status: 400 });
}

export default function ClientProfile({ loaderData, actionData }: Route.ComponentProps) {
  const { user } = loaderData;
  const submit = useSubmit();

  return (
    <SidebarShell user={user} navGroups={getNavGroups("client")}>
      <div className="max-w-2xl mx-auto w-full pb-12 flex flex-col gap-8">
        <div className="border-b border-hairline pb-6">
          <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Profile</h1>
          <p className="text-base text-ink-muted-80">Manage your account details.</p>
        </div>

        <section className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-action/10 text-action flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden">
            {user.profilePictureR2Key ? (
              <img src="/client/profile/picture" alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <Form method="post" encType="multipart/form-data" className="flex flex-col gap-2">
            <input type="hidden" name="intent" value="upload_picture" />
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-action hover:underline w-fit">
              Change photo
              <input
                type="file"
                name="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    submit(e.currentTarget.form);
                  }
                }}
              />
            </label>
            {actionData?.intent === "upload_picture" && "error" in actionData && (
              <p className="text-red-600 text-sm">{actionData.error}</p>
            )}
          </Form>
        </section>

        <section className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Name &amp; email</h2>
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="update_info" />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted-80">Name</span>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="border border-hairline rounded-lg px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted-80">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="border border-hairline rounded-lg px-3 py-2"
              />
            </label>
            {actionData?.intent === "update_info" && "error" in actionData && (
              <p className="text-red-600 text-sm">{actionData.error}</p>
            )}
            {actionData?.intent === "update_info" && "success" in actionData && (
              <p className="text-green-600 text-sm">Saved.</p>
            )}
            <button
              type="submit"
              className="self-start text-sm font-medium text-white bg-action hover:bg-action-focus px-4 py-2 rounded-lg transition-colors"
            >
              Save changes
            </button>
          </Form>
        </section>

        <section className="bg-surface-pearl border border-hairline rounded-2xl soft-shadow p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Password</h2>
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="change_password" />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted-80">Current password</span>
              <input
                name="currentPassword"
                type="password"
                required
                className="border border-hairline rounded-lg px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-ink-muted-80">New password</span>
              <input
                name="newPassword"
                type="password"
                minLength={8}
                required
                className="border border-hairline rounded-lg px-3 py-2"
              />
            </label>
            {actionData?.intent === "change_password" && "error" in actionData && (
              <p className="text-red-600 text-sm">{actionData.error}</p>
            )}
            {actionData?.intent === "change_password" && "success" in actionData && (
              <p className="text-green-600 text-sm">Password updated.</p>
            )}
            <button
              type="submit"
              className="self-start text-sm font-medium text-white bg-action hover:bg-action-focus px-4 py-2 rounded-lg transition-colors"
            >
              Update password
            </button>
          </Form>
        </section>
      </div>
    </SidebarShell>
  );
}
