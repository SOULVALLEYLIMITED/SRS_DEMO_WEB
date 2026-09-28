export type LessonStatus = "On Track" | "Needs Attention";

export interface StructuredResult {
  lessonCovered: string;
  strength: string;
  challenge: string;
  studentsNeedingAttention: string;
  lessonCompletion: "Completed" | "Incomplete";
  completionNote: string;
  followUp: string;
  status: LessonStatus;
}

export interface TeacherReport {
  id: string;
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  reportText: string;
  submittedAt: string;
  structured: StructuredResult;
  source: "ai" | "fallback";
}

export interface NewReportInput {
  teacherName: string;
  className: string;
  subject: string;
  date: string;
  reportText: string;
}
