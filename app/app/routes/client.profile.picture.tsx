import type { Route } from "./+types/client.profile.picture";
import { requireUser, getProfilePicture } from "../lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client"]);
  if (!user.profilePictureR2Key) throw new Response("Not found", { status: 404 });

  const object = await getProfilePicture(user.profilePictureR2Key);
  if (!object) throw new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
    },
  });
}
