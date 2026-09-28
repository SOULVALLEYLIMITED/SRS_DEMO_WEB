export type LessonStatus = "On Track" | "Needs Attention";

export const REPORT_TYPES = [
  "Lesson Report",
  "Teacher Report",
  "Holiday Report",
  "General Report",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export interface ResultTable {
  columns: string[];
  rows: string[][];
}

export interface ExtractedMeta {
  teacherName: string;
  className: string;
  subject: string;
  date: string;
}

export interface StructuredResult {
  lessonCovered: string;
  strength: string;
  challenge: string;
  studentsNeedingAttention: string;
  lessonCompletion: "Completed" | "Incomplete";
  completionNote: string;
  followUp: string;
  status: LessonStatus;
  table: ResultTable;
}

export interface TeacherReport {
  id: string;
  reportType: ReportType;
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  reportText: string;
  sourceFileName?: string;
  submittedAt: string;
  structured: StructuredResult;
  source: "ai" | "fallback";
}

export interface NewReportInput {
  reportType: ReportType;
  reportText: string;
  sourceFileName?: string;
}
