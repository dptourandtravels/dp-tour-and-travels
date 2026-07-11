import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { db } from "./auth.server";
import { documents, documentTypes, type DocumentType } from "../db/schema";

export { documentTypes };

export async function listDocumentsForClient(clientId: string) {
  const rows = await db.select().from(documents).where(eq(documents.clientId, clientId));
  const byType = new Map(rows.map((d) => [d.docType, d]));
  return documentTypes.map((type) => ({ type, doc: byType.get(type) ?? null }));
}

export async function uploadDocument(clientId: string, docType: DocumentType, file: File) {
  const key = `${clientId}/${docType}`;
  await env.DOCUMENTS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  const [existing] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.clientId, clientId), eq(documents.docType, docType)))
    .limit(1);

  if (existing) {
    await db
      .update(documents)
      .set({ fileName: file.name, uploadedAt: new Date() })
      .where(eq(documents.id, existing.id));
  } else {
    await db.insert(documents).values({
      id: crypto.randomUUID(),
      clientId,
      docType,
      fileName: file.name,
      r2Key: key,
      uploadedAt: new Date(),
    });
  }
}

export async function getDocumentForDownload(clientId: string, docType: DocumentType) {
  const [row] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.clientId, clientId), eq(documents.docType, docType)))
    .limit(1);
  if (!row) return null;

  const object = await env.DOCUMENTS.get(row.r2Key);
  if (!object) return null;

  return { object, fileName: row.fileName };
}
