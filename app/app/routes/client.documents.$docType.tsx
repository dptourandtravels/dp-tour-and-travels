import type { Route } from "./+types/client.documents.$docType";
import { requireUser } from "../lib/auth.server";
import { getDocumentForDownload, documentTypes } from "../lib/documents.server";
import type { DocumentType } from "../db/schema";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request, ["client"]);
  if (!documentTypes.includes(params.docType as DocumentType)) {
    throw new Response("Not found", { status: 404 });
  }

  const result = await getDocumentForDownload(user.id, params.docType as DocumentType);
  if (!result) throw new Response("Not found", { status: 404 });

  return new Response(result.object.body, {
    headers: {
      "Content-Type": result.object.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${result.fileName}"`,
    },
  });
}
