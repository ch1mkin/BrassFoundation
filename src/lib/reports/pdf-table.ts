import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 40;

/** StandardFonts only support WinAnsi — strip unsupported glyphs. */
export function pdfSafeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, 240);
}

export async function buildSimpleTablePdf(input: {
  title: string;
  metaLines: string[];
  header: string;
  lines: string[];
  emptyMessage: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage(A4);
  let y = page.getHeight() - MARGIN;
  const maxWidth = page.getWidth() - MARGIN * 2;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage(A4);
      y = page.getHeight() - MARGIN;
    }
  };

  const drawWrapped = (
    text: string,
    size: number,
    font: typeof regular,
    color = rgb(0.05, 0.05, 0.05),
    gap = size + 4,
  ) => {
    const safe = pdfSafeText(text);
    const words = safe.split(/\s+/).filter(Boolean);
    let line = "";
    const flush = () => {
      if (!line) return;
      ensureSpace(gap);
      page.drawText(line, {
        x: MARGIN,
        y: y - size,
        size,
        font,
        color,
      });
      y -= gap;
      line = "";
    };
    for (const word of words.length ? words : [""]) {
      const next = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(next, size);
      if (width > maxWidth && line) {
        flush();
        line = word;
      } else {
        line = next;
      }
    }
    flush();
  };

  drawWrapped(input.title, 16, bold, rgb(0, 0.17, 0.36), 22);
  y -= 4;
  for (const meta of input.metaLines) {
    drawWrapped(meta, 10, regular, rgb(0.3, 0.3, 0.3), 14);
  }
  y -= 8;
  drawWrapped(input.header, 9, bold, rgb(0.1, 0.1, 0.1), 14);
  y -= 2;

  if (!input.lines.length) {
    drawWrapped(input.emptyMessage, 11, regular);
  } else {
    for (const line of input.lines) {
      drawWrapped(line, 8, regular, rgb(0.08, 0.08, 0.08), 12);
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
