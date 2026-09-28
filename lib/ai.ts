import type { NewReportInput, StructuredResult } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are the AI step in a school workflow demo. A teacher submits a plain-language lesson report. Your job is to extract, organize, summarize, and highlight information that is ALREADY PRESENT in the report so a headmaster/principal can understand it at a glance.

Rules:
- Do not invent facts that are not stated or clearly implied in the report.
- Do not replace the teacher's account or make school decisions.
- Keep every field concise (one short sentence or phrase).
- If the report gives no clear information for a field, say "Not mentioned in report" for text fields.

Respond with ONLY a JSON object with exactly these keys:
{
  "lessonCovered": string,            // the topic/lesson covered, short phrase
  "strength": string,                 // what most students understood well
  "challenge": string,                // what students struggled with, if anything
  "studentsNeedingAttention": string, // e.g. "Approximately 8" or "None mentioned"
  "lessonCompletion": "Completed" | "Incomplete",
  "completionNote": string,           // one short sentence explaining why, if incomplete
  "followUp": string,                 // a concrete, short suggested next step for the next lesson
  "status": "On Track" | "Needs Attention"
}`;

function buildUserPrompt(input: NewReportInput): string {
  return `Class: ${input.className}
Subject: ${input.subject}
Date: ${input.date}

Teacher's Report:
${input.reportText}`;
}

function heuristicStructure(input: NewReportInput): StructuredResult {
  const text = input.reportText;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const findSentence = (keywords: RegExp) =>
    sentences.find((s) => keywords.test(s));

  const strengthSentence = findSentence(/understood|grasped|good grasp|picked up|confident/i);
  const challengeSentence = findSentence(/struggl|difficult|confus|trouble|hard time|didn'?t (grasp|understand)/i);
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

  return {
    lessonCovered,
    strength: strengthSentence ?? "Not mentioned in report",
    challenge,
    studentsNeedingAttention,
    lessonCompletion,
    completionNote: incompleteSentence ?? "Lesson was completed as planned.",
    followUp,
    status,
  };
}

export async function structureReport(
  input: NewReportInput
): Promise<{ structured: StructuredResult; source: "ai" | "fallback" }> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { structured: heuristicStructure(input), source: "fallback" };
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as StructuredResult;

    if (
      !parsed.lessonCovered ||
      !parsed.status ||
      (parsed.status !== "On Track" && parsed.status !== "Needs Attention")
    ) {
      throw new Error("Malformed AI response");
    }

    return { structured: parsed, source: "ai" };
  } catch (err) {
    console.error("Groq structuring failed, using fallback:", err);
    return { structured: heuristicStructure(input), source: "fallback" };
  }
}
