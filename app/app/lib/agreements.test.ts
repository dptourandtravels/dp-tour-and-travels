import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { renderAgreementPdf, type AgreementFields } from "./agreements.ts";

// pdf-lib Flate-compresses content streams and hex-encodes drawn text (<...> Tj).
// Decompress + hex-decode to check the PDF actually contains what we asked it to draw.
function extractDrawnText(pdfBytes: Uint8Array): string {
  const raw = Buffer.from(pdfBytes).toString("latin1");
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let decoded = "";
  let match: RegExpExecArray | null;
  while ((match = streamRe.exec(raw))) {
    let inflated: Buffer;
    try {
      inflated = inflateSync(Buffer.from(match[1], "latin1"));
    } catch {
      continue;
    }
    for (const [, hex] of inflated.toString("latin1").matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
      decoded += Buffer.from(hex, "hex").toString("latin1");
    }
  }
  return decoded;
}

test("renderAgreementPdf produces a valid PDF containing all 5 fields", async () => {
  const fields: AgreementFields = {
    carDescription: "Toyota Innova",
    registrationNumber: "KA01AB1234",
    ownerName: "Car Owner One",
    aadhaarUid: "123412341234",
    rate: 15000,
  };

  const bytes = await renderAgreementPdf(fields);
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString("latin1"), "%PDF-");

  const text = extractDrawnText(bytes);
  for (const value of [
    fields.carDescription,
    fields.registrationNumber,
    fields.ownerName,
    fields.aadhaarUid,
    String(fields.rate),
  ]) {
    assert.ok(text.includes(value), `expected PDF text to include "${value}"`);
  }
});
