import type { Route } from "./+types/agreements.$id.download";
import { requireUser } from "../lib/auth.server";
import { getAgreementById } from "../lib/agreements.server";
import { renderAgreementPdf } from "../lib/agreements";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const agreement = await getAgreementById(params.id);
  if (!agreement) throw new Response("Not found", { status: 404 });

  const isStaff = user.role === "finance" || user.role === "superadmin";
  if (!isStaff && agreement.partyUserId !== user.id) {
    throw new Response("Not found", { status: 404 });
  }

  const pdfBytes = await renderAgreementPdf(agreement);
  return new Response(pdfBytes as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="agreement-${agreement.registrationNumber}.pdf"`,
    },
  });
}
