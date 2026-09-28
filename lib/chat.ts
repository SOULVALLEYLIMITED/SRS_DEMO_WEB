import { callGroqJSON, heuristicStructure, isValidTable } from "./ai";
import type { ChatTurnResult, ReportType, ResultTable } from "./types";

const CHAT_SYSTEM_PROMPT = `You are a friendly assistant helping a teacher describe a report for their headmaster, through an ordinary chat conversation — not a form. The teacher writes naturally, possibly across several short messages, describing what happened (a lesson, a holiday activity, a general update, etc).

After each of their messages, you see the FULL conversation so far. Your job:
1. Give a brief, warm, natural reply (1-2 sentences max). Acknowledge what they said.
2. If the report is still thin (e.g. no sense of how it went, or whether it was completed), ask ONE short, specific follow-up question to draw out useful detail. Do not interrogate — one question at a time, only if genuinely useful.
3. Once there is enough to make a useful report (a clear topic/focus AND some sense of how it went), stop asking questions. Tell them briefly they can click "Generate Report" when ready, and set "readyToGenerate": true.
4. Whenever readyToGenerate is true, ALSO include a compact "previewTable" summarizing what you understand so far, in the exact same shape a final report table would use, so they can see it taking shape live in the chat.

Never invent facts. Never fill in details they haven't said. Keep your reply conversational and short — this appears as a chat bubble, not a report.

Respond with ONLY a JSON object:
{
  "reply": string,
  "readyToGenerate": boolean,
  "previewTable": { "columns": ["Aspect", "Details"], "rows": [[string, string], ...] } | null
}`;

function buildChatUserPrompt(reportType: ReportType, transcript: string): string {
  return `Report type: ${reportType}

Full conversation so far (teacher's messages only, in order):
${transcript}`;
}

function heuristicChatTurn(reportType: ReportType, transcript: string): ChatTurnResult {
  const trimmed = transcript.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (wordCount < 12) {
    return {
      reply: "Got it — could you say a bit more about how it went, or whether anything came up?",
      readyToGenerate: false,
    };
  }

  const structured = heuristicStructure({ reportType, reportText: trimmed });
  return {
    reply: "Thanks, that's helpful! Click **Generate Report** whenever you're ready, or keep adding detail.",
    readyToGenerate: true,
    previewTable: structured.table,
  };
}

export async function chatTurn(
  reportType: ReportType,
  transcript: string
): Promise<ChatTurnResult> {
  if (!process.env.GROQ_API_KEY) {
    return heuristicChatTurn(reportType, transcript);
  }

  try {
    const parsed = (await callGroqJSON(
      CHAT_SYSTEM_PROMPT,
      buildChatUserPrompt(reportType, transcript)
    )) as Partial<ChatTurnResult>;

    if (!parsed.reply || typeof parsed.readyToGenerate !== "boolean") {
      throw new Error("Malformed chat response");
    }

    const previewTable: ResultTable | undefined = isValidTable(parsed.previewTable)
      ? parsed.previewTable
      : undefined;

    return { reply: parsed.reply, readyToGenerate: parsed.readyToGenerate, previewTable };
  } catch (err) {
    console.error("Groq chat turn failed, using fallback:", err);
    return heuristicChatTurn(reportType, transcript);
  }
}
