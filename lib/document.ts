import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
} from "docx";
import type { TeacherReport } from "./types";

const PAGE_WIDTH_DXA = 12240;
const PAGE_HEIGHT_DXA = 15840;
const MARGIN_DXA = 1080;
const TABLE_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2;
const LABEL_WIDTH_DXA = Math.round(TABLE_WIDTH_DXA * 0.28);
const VALUE_WIDTH_DXA = TABLE_WIDTH_DXA - LABEL_WIDTH_DXA;

const BAR_FILL = "DDD6FE";
const LABEL_FILL = "F1F5F9";
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

let logoBuffer: Buffer | null | undefined;
function loadLogo(): Buffer | null {
  if (logoBuffer !== undefined) return logoBuffer;
  try {
    logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    logoBuffer = null;
  }
  return logoBuffer;
}

/** A left label cell + right value cell, mirroring the reference template's
 * "Project Title / Country / ..." rows. */
function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: LABEL_WIDTH_DXA, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: LABEL_FILL },
        borders: CELL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: VALUE_WIDTH_DXA, type: WidthType.DXA },
        borders: CELL_BORDERS,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: lines(value),
      }),
    ],
  });
}

/** A full-width shaded section-header bar spanning both columns, mirroring
 * the reference template's "Project Description and Key Lessons-Learned" bar. */
function sectionBarRow(text: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: BAR_FILL },
        borders: CELL_BORDERS,
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20 })],
          }),
        ],
      }),
    ],
  });
}

function lines(text: string): Paragraph[] {
  const parts = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (parts.length === 0) return [new Paragraph({ children: [] })];
  return parts.map(
    (line, i) =>
      new Paragraph({
        spacing: { after: i === parts.length - 1 ? 0 : 80 },
        children: [new TextRun({ text: line })],
      })
  );
}

export async function buildReportDocx(report: TeacherReport): Promise<Buffer> {
  const { structured } = report;
  const logo = loadLogo();

  const letterhead = new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [Math.round(TABLE_WIDTH_DXA * 0.6), Math.round(TABLE_WIDTH_DXA * 0.4)],
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: Math.round(TABLE_WIDTH_DXA * 0.6), type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Soul Valley", bold: true, size: 26 })],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "School Report System", size: 18, color: "64748B" }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: Math.round(TABLE_WIDTH_DXA * 0.4), type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: logo
                  ? [new ImageRun({ data: logo, type: "png", transformation: { width: 48, height: 48 } })]
                  : [],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const summaryRows = structured.table.rows.map(([label, value]) => labelValueRow(label, value));

  const mainTable = new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [LABEL_WIDTH_DXA, VALUE_WIDTH_DXA],
    rows: [
      labelValueRow("Report Title", `${report.reportType} — ${report.subject}`),
      labelValueRow("Class", report.className),
      labelValueRow("Teacher", report.teacherName),
      labelValueRow("Date", report.date),
      labelValueRow("Status", structured.status),
      labelValueRow("Submitted On", new Date(report.submittedAt).toLocaleString()),

      sectionBarRow("Report Summary and Key Findings"),
      ...summaryRows,

      sectionBarRow("Original Submission (Teacher's Own Words)"),
      labelValueRow(
        "Report Text",
        report.sourceFileName ? `(from uploaded file: ${report.sourceFileName})\n\n${report.reportText}` : report.reportText
      ),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH_DXA, height: PAGE_HEIGHT_DXA },
            margin: { top: MARGIN_DXA, bottom: MARGIN_DXA, left: MARGIN_DXA, right: MARGIN_DXA },
          },
        },
        children: [
          letterhead,
          new Paragraph({ spacing: { before: 300, after: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: `${report.reportType.toUpperCase()}`, bold: true, size: 32 }),
            ],
          }),

          mainTable,

          new Paragraph({
            spacing: { before: 300 },
            children: [
              new TextRun({
                text:
                  report.source === "ai"
                    ? "This summary was generated by AI from the original submission above, which remains the source of record."
                    : "This summary was generated automatically from the original submission above, which remains the source of record.",
                italics: true,
                size: 18,
                color: "64748B",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
