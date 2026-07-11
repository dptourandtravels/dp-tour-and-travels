// Pure, no Cloudflare imports — pdf-lib runs fine under plain Node too.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type AgreementFields = {
  carDescription: string;
  registrationNumber: string;
  ownerName: string;
  aadhaarUid: string;
  rate: number;
};

export async function renderAgreementPdf(fields: AgreementFields): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  const line = (text: string, size = 12, useFont = font) => {
    page.drawText(text, { x: 50, y, size, font: useFont, color: rgb(0, 0, 0) });
    y -= size + 10;
  };

  line("VEHICLE LEASE AGREEMENT", 18, bold);
  y -= 10;
  line(`Car: ${fields.carDescription}`);
  line(`Registration Number: ${fields.registrationNumber}`);
  line(`Owner: ${fields.ownerName}`);
  line(`Aadhaar UID: ${fields.aadhaarUid}`);
  line(`Rate: Rs. ${fields.rate} / month`);

  return doc.save();
}
