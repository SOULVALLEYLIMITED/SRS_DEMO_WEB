import type { ExtractedMeta, NewReportInput, ResultTable, StructuredResult } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callGroqJSON(
  systemPrompt: string,
  userPrompt: string
): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY configured");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  return JSON.parse(content);
}

const SYSTEM_PROMPT = `You are the AI step in a school workflow demo. A teacher submits a plain-language report through a chat box — this could be a lesson report, a general teacher report, a holiday/term-break report, or another kind of report about their class or work. They do NOT fill in any form fields; they just write naturally, the way they'd describe it to a colleague. Your job is to (1) extract the class, subject, date, and teacher name if they are mentioned or clearly implied, and (2) extract, organize, summarize, and highlight the report's content so a headmaster/principal can understand it at a glance.

Rules:
- Do not invent facts that are not stated or clearly implied in the report.
- Do not replace the teacher's account or make school decisions.
- Keep every field concise (one short sentence or phrase).
- If the report gives no clear information for a field, say "Not mentioned in report" for text fields.
- Interpret each field sensibly for the report's actual type (e.g. for a holiday report "lessonCovered" means the main topic/focus of the period, not a classroom lesson; "studentsNeedingAttention" can be "None mentioned in report" when not applicable).

Respond with ONLY a JSON object with exactly these keys:
{
  "meta": {
    "teacherName": string, // the teacher's name if mentioned/signed, else "Unnamed Teacher"
    "className": string,   // the class/grade mentioned (e.g. "JSS 2A"), else "Not specified"
    "subject": string,     // the subject mentioned (e.g. "Mathematics"), else "General"
    "date": string          // the date/day mentioned in the text (e.g. "Monday", "12 March"), else "" (empty string)
  },
  "lessonCovered": string,            // the main topic/focus of the report, short phrase
  "strength": string,                 // what went well / what was understood
  "challenge": string,                // what was difficult, if anything
  "studentsNeedingAttention": string, // e.g. "Approximately 8" or "None mentioned"
  "lessonCompletion": "Completed" | "Incomplete",
  "completionNote": string,           // one short sentence explaining why, if incomplete
  "followUp": string,                 // a concrete, short suggested next step
  "status": "On Track" | "Needs Attention",
  "table": {                          // the same findings laid out as a table for quick scanning
    "columns": ["Aspect", "Details"],
    "rows": [                         // one row per aspect above, e.g. ["Topic Covered", "..."]
      [string, string]
    ]
  }
}

For "table": always include one row per aspect (Topic Covered, Strength, Challenge, Students Needing Attention, Completion Status, Follow-up). If the report clearly describes MULTIPLE distinct topics, activities, or groups, add one extra row PER topic/group instead of collapsing them (e.g. ["Topic: Fractions", "Most understood; a few struggled with unlike denominators"], ["Topic: Decimals", "Not yet covered"]) so the table stays genuinely useful, not just a restatement.`;

function buildUserPrompt(input: NewReportInput): string {
  return `Report type: ${input.reportType}

Teacher's message:
${input.reportText}`;
}

function buildDefaultTable(structured: Omit<StructuredResult, "table">): ResultTable {
  return {
    columns: ["Aspect", "Details"],
    rows: [
      ["Topic Covered", structured.lessonCovered],
      ["Strength", structured.strength],
      ["Challenge", structured.challenge],
      ["Students Needing Attention", structured.studentsNeedingAttention],
      [
        "Completion Status",
        `${structured.lessonCompletion} — ${structured.completionNote}`,
      ],
      ["Suggested Follow-up", structured.followUp],
    ],
  };
}

export function isValidTable(table: unknown): table is ResultTable {
  if (!table || typeof table !== "object") return false;
  const t = table as ResultTable;
  return (
    Array.isArray(t.columns) &&
    t.columns.every((c) => typeof c === "string") &&
    Array.isArray(t.rows) &&
    t.rows.every(
      (row) => Array.isArray(row) && row.every((cell) => typeof cell === "string")
    ) &&
    t.rows.length > 0
  );
}

function todayFriendly(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function resolveMeta(meta: Partial<ExtractedMeta> | undefined): ExtractedMeta {
  return {
    teacherName: meta?.teacherName?.trim() || "Unnamed Teacher",
    className: meta?.className?.trim() || "Not specified",
    subject: meta?.subject?.trim() || "General",
    date: meta?.date?.trim() || todayFriendly(),
  };
}

const KNOWN_SUBJECTS = [
  "Mathematics",
  "English Language",
  "English",
  "Basic Science",
  "Social Studies",
  "Agricultural Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Geography",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Computer Studies",
  "Further Mathematics",
  "Literature",
  "History",
];

function extractMetaHeuristic(text: string): ExtractedMeta {
  const classMatch = text.match(
    /\b((?:JSS|SSS|SS|Primary|Basic|Grade|Class|Year)\s?\d{1,2}[A-Z]?)\b/i
  );
  const subjectMatch = KNOWN_SUBJECTS.find((s) =>
    new RegExp(`\\b${s}\\b`, "i").test(text)
  );
  const dayMatch = text.match(
    /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i
  );
  const nameMatch = text.match(
    /\b(?:I'?m|I am|This is)\s+((?:Mr|Mrs|Miss|Ms|Dr)\.?\s+[A-Z][a-z]+)/
  );

  return resolveMeta({
    teacherName: nameMatch?.[1],
    className: classMatch?.[1]?.toUpperCase(),
    subject: subjectMatch,
    date: dayMatch?.[1],
  });
}

export function heuristicStructure(input: NewReportInput): StructuredResult {
  const text = input.reportText;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Split on clause-level conjunctions too, so a single sentence like
  // "Most understood X, but several struggled with Y" yields distinct
  // strength/challenge clauses instead of the same sentence twice.
  const clauses = sentences.flatMap((s) =>
    s.split(/,?\s+\b(?:but|however|although|while)\b\s+/i)
  );

  const findSentence = (keywords: RegExp) =>
    sentences.find((s) => keywords.test(s));
  const findClause = (keywords: RegExp) =>
    clauses.find((c) => keywords.test(c));

  const strengthSentence = findClause(/understood|grasped|good grasp|picked up|confident/i);
  const challengeSentence = findClause(/struggl|difficult|confus|trouble|hard time|didn'?t (grasp|understand)/i);
  const incompleteSentence = findSentence(
    /didn'?t finish|did not finish|ran out of time|incomplete|couldn'?t complete|behind schedule/i
  );

  const numberMatch = text.match(/(about|approximately|around)?\s*(\d+)\s+students?/i);
  const studentsNeedingAttention = numberMatch
    ? `Approximately ${numberMatch[2]}`
    : "None mentioned in report";

  const topicMatch = text.match(
    /(?:continued|covered|started|reviewed|introduced|taught|worked on|on)\s+([a-z][a-z\s]{2,40}?)(?:[.,]|\s+(?:but|and|today|this)|$)/i
  );
  const lessonCovered = topicMatch
    ? topicMatch[1].trim().replace(/\s+/g, " ")
    : "Not mentioned in report";

  const lessonCompletion: StructuredResult["lessonCompletion"] = incompleteSentence
    ? "Incomplete"
    : "Completed";

  const challenge = challengeSentence ?? "No significant difficulty mentioned.";
  const status: StructuredResult["status"] =
    challengeSentence || lessonCompletion === "Incomplete" ? "Needs Attention" : "On Track";

  const followUp = challengeSentence
    ? `Review ${lessonCovered.toLowerCase()} again, focusing on the area students found difficult.`
    : "Continue to the next topic as planned.";

  const base = {
    lessonCovered,
    strength: strengthSentence ?? "Not mentioned in report",
    challenge,
    studentsNeedingAttention,
    lessonCompletion,
    completionNote: incompleteSentence ?? "Lesson was completed as planned.",
    followUp,
    status,
  };

  return { ...base, table: buildDefaultTable(base) };
}

export async function structureReport(input: NewReportInput): Promise<{
  meta: ExtractedMeta;
  structured: StructuredResult;
  source: "ai" | "fallback";
}> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      meta: extractMetaHeuristic(input.reportText),
      structured: heuristicStructure(input),
      source: "fallback",
    };
  }

  try {
    const parsed = (await callGroqJSON(SYSTEM_PROMPT, buildUserPrompt(input))) as StructuredResult & {
      meta?: Partial<ExtractedMeta>;
    };

    if (
      !parsed.lessonCovered ||
      !parsed.status ||
      (parsed.status !== "On Track" && parsed.status !== "Needs Attention")
    ) {
      throw new Error("Malformed AI response");
    }

    if (!isValidTable(parsed.table)) {
      parsed.table = buildDefaultTable(parsed);
    }

    const meta = resolveMeta(parsed.meta);
    delete (parsed as { meta?: unknown }).meta;

    return { meta, structured: parsed, source: "ai" };
  } catch (err) {
    console.error("Groq structuring failed, using fallback:", err);
    return {
      meta: extractMetaHeuristic(input.reportText),
      structured: heuristicStructure(input),
      source: "fallback",
    };
  }
}
