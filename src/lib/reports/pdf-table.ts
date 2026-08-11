import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type PDFImage } from "pdf-lib";

/** Landscape A4 — better for multi-column report tables. */
const PAGE: [number, number] = [841.89, 595.28];
const MARGIN = { top: 48, right: 36, bottom: 40, left: 36 };
const HEADER_H = 26;
const ROW_H = 22;
const CELL_PAD_X = 6;

export type PdfTableColumn = {
  key: string;
  header: string;
  /** Relative width weight */
  weight: number;
};

/** StandardFonts only support WinAnsi — strip unsupported glyphs. */
export function pdfSafeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, 180);
}

async function loadLogoBytes(): Promise<Uint8Array | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
    const buf = await readFile(logoPath);
    return new Uint8Array(buf);
  } catch (err) {
    console.error("[pdf] logo load failed:", err);
    return null;
  }
}

function drawWatermark(
  page: PDFPage,
  logo: PDFImage | null,
  font: PDFFont,
) {
  const { width, height } = page.getSize();
  if (logo) {
    const size = Math.min(width, height) * 0.42;
    const dims = logo.scale(size / Math.max(logo.width, logo.height));
    page.drawImage(logo, {
      x: (width - dims.width) / 2,
      y: (height - dims.height) / 2,
      width: dims.width,
      height: dims.height,
      opacity: 0.07,
    });
  } else {
    const label = "BRASS Foundation";
    const size = 28;
    const tw = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: (width - tw) / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0, 0.17, 0.36),
      opacity: 0.06,
    });
  }
}

function truncateToWidth(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const safe = pdfSafeText(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  let out = safe;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

export async function buildBrandedTablePdf(input: {
  title: string;
  metaLines: string[];
  columns: PdfTableColumn[];
  rows: Record<string, string | number | null | undefined>[];
  emptyMessage?: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let logoImage: PDFImage | null = null;
  const logoBytes = await loadLogoBytes();
  if (logoBytes) {
    try {
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch {
      try {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } catch (err) {
        console.error("[pdf] logo embed failed:", err);
      }
    }
  }

  const totalWeight = input.columns.reduce((s, c) => s + c.weight, 0);
  const tableWidth = PAGE[0] - MARGIN.left - MARGIN.right;
  const colWidths = input.columns.map(
    (c) => (c.weight / totalWeight) * tableWidth,
  );

  const brand = rgb(0, 0.17, 0.36); // #002B5B
  const brandSoft = rgb(0.94, 0.96, 0.98);
  const border = rgb(0.82, 0.86, 0.9);
  const textMuted = rgb(0.35, 0.4, 0.45);
  const textMain = rgb(0.08, 0.1, 0.14);
  const headerBg = rgb(0, 0.17, 0.36);
  const headerFg = rgb(1, 1, 1);
  const altRow = rgb(0.97, 0.98, 0.99);

  let page = pdfDoc.addPage(PAGE);
  drawWatermark(page, logoImage, bold);
  let y = PAGE[1] - MARGIN.top;
  let pageNo = 1;

  const newPage = () => {
    page = pdfDoc.addPage(PAGE);
    drawWatermark(page, logoImage, bold);
    pageNo += 1;
    y = PAGE[1] - MARGIN.top;
    drawTitleBlock(false);
    drawTableHeader();
  };

  const drawTitleBlock = (firstPage: boolean) => {
    if (logoImage && firstPage) {
      const mark = 42;
      const dims = logoImage.scale(mark / Math.max(logoImage.width, logoImage.height));
      page.drawImage(logoImage, {
        x: MARGIN.left,
        y: y - dims.height,
        width: dims.width,
        height: dims.height,
        opacity: 0.95,
      });
      page.drawText(pdfSafeText(input.title), {
        x: MARGIN.left + dims.width + 12,
        y: y - 18,
        size: 16,
        font: bold,
        color: brand,
      });
      y -= Math.max(dims.height, 28) + 8;
    } else {
      page.drawText(pdfSafeText(input.title), {
        x: MARGIN.left,
        y: y - 16,
        size: 15,
        font: bold,
        color: brand,
      });
      y -= 24;
    }

    for (const meta of input.metaLines) {
      page.drawText(pdfSafeText(meta), {
        x: MARGIN.left,
        y: y - 10,
        size: 9,
        font: regular,
        color: textMuted,
      });
      y -= 14;
    }
    y -= 8;
  };

  const drawTableHeader = () => {
    let x = MARGIN.left;
    page.drawRectangle({
      x: MARGIN.left,
      y: y - HEADER_H,
      width: tableWidth,
      height: HEADER_H,
      color: headerBg,
      borderColor: headerBg,
      borderWidth: 0.5,
    });
    input.columns.forEach((col, i) => {
      const w = colWidths[i];
      const label = truncateToWidth(col.header, bold, 8, w - CELL_PAD_X * 2);
      page.drawText(label, {
        x: x + CELL_PAD_X,
        y: y - HEADER_H + 8,
        size: 8,
        font: bold,
        color: headerFg,
      });
      // vertical grid
      page.drawLine({
        start: { x, y: y },
        end: { x, y: y - HEADER_H },
        thickness: 0.4,
        color: rgb(0.1, 0.28, 0.42),
      });
      x += w;
    });
    page.drawLine({
      start: { x: MARGIN.left + tableWidth, y },
      end: { x: MARGIN.left + tableWidth, y: y - HEADER_H },
      thickness: 0.4,
      color: rgb(0.1, 0.28, 0.42),
    });
    y -= HEADER_H;
  };

  const drawFooter = () => {
    page.drawText(pdfSafeText(`BRASS Foundation · Page ${pageNo}`), {
      x: MARGIN.left,
      y: 18,
      size: 8,
      font: regular,
      color: textMuted,
    });
  };

  drawTitleBlock(true);
  drawTableHeader();

  if (!input.rows.length) {
    page.drawRectangle({
      x: MARGIN.left,
      y: y - 36,
      width: tableWidth,
      height: 36,
      color: brandSoft,
      borderColor: border,
      borderWidth: 0.6,
    });
    page.drawText(pdfSafeText(input.emptyMessage || "No rows to display."), {
      x: MARGIN.left + 12,
      y: y - 22,
      size: 10,
      font: regular,
      color: textMuted,
    });
    y -= 36;
  } else {
    input.rows.forEach((row, rowIndex) => {
      if (y - ROW_H < MARGIN.bottom + 16) {
        drawFooter();
        newPage();
      }

      const bg = rowIndex % 2 === 0 ? rgb(1, 1, 1) : altRow;
      page.drawRectangle({
        x: MARGIN.left,
        y: y - ROW_H,
        width: tableWidth,
        height: ROW_H,
        color: bg,
        borderColor: border,
        borderWidth: 0.4,
      });

      let x = MARGIN.left;
      input.columns.forEach((col, i) => {
        const w = colWidths[i];
        const raw = row[col.key];
        const label = truncateToWidth(
          raw == null || raw === "" ? "—" : String(raw),
          regular,
          8,
          w - CELL_PAD_X * 2,
        );
        page.drawText(label, {
          x: x + CELL_PAD_X,
          y: y - ROW_H + 7,
          size: 8,
          font: regular,
          color: textMain,
        });
        page.drawLine({
          start: { x, y },
          end: { x, y: y - ROW_H },
          thickness: 0.35,
          color: border,
        });
        x += w;
      });
      page.drawLine({
        start: { x: MARGIN.left + tableWidth, y },
        end: { x: MARGIN.left + tableWidth, y: y - ROW_H },
        thickness: 0.35,
        color: border,
      });
      y -= ROW_H;
    });
  }

  drawFooter();

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
