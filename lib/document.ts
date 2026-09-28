import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
} from "docx";
import type { TeacherReport } from "./types";

const PAGE_WIDTH_DXA = 12240;
const PAGE_HEIGHT_DXA = 15840;
const MARGIN_DXA = 1080;
const TABLE_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2;
const COL_WIDTHS = [Math.round(TABLE_WIDTH_DXA * 0.3), Math.round(TABLE_WIDTH_DXA * 0.7)];

function metaLine(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: value }),
    ],
  });
}

function headerCell(text: string): TableCell {
  return new TableCell({
    width: { size: COL_WIDTHS[0], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: "EDE9FE" },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function bodyCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text })] })],
  });
}

export async function buildReportDocx(report: TeacherReport): Promise<Buffer> {
  const { structured } = report;

  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: structured.table.columns.map((col) => headerCell(col)),
    }),
    ...structured.table.rows.map(
      (row) =>
        new TableRow({
          children: row.map((cell, i) => bodyCell(cell, COL_WIDTHS[i] ?? COL_WIDTHS[1])),
        })
    ),
  ];

  const reportParagraphs = report.reportText
    .split(/\n+/)
    .filter((line) => line.trim().length > 0)
    .map(
      (line) =>
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: line })] })
    );

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
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: `Soul Valley SRS — ${report.reportType}` })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `${report.className} — ${report.subject}`,
                bold: true,
                size: 28,
              }),
            ],
          }),

          metaLine("Teacher", report.teacherName),
          metaLine("Date", report.date),
          metaLine("Lesson Status", structured.status),
          metaLine("Submitted", new Date(report.submittedAt).toLocaleString()),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "AI-Structured Summary" })],
          }),
          new Table({
            width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: COL_WIDTHS,
            rows: tableRows,
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "Original Teacher Report" })],
          }),
          ...(reportParagraphs.length
            ? reportParagraphs
            : [new Paragraph({ children: [new TextRun({ text: report.reportText })] })]),

          new Paragraph({
            spacing: { before: 400 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            },
            children: [],
          }),
          new Paragraph({
            spacing: { before: 150 },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text:
                  report.source === "ai"
                    ? "Structured by AI from the teacher's original report. The original report above is the source of record."
                    : "Structured automatically from the teacher's original report. The original report above is the source of record.",
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
