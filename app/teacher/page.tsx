"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, CheckCircle2, Download, Paperclip, X } from "lucide-react";
import { Header } from "@/app/components/Header";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ResultTable } from "@/app/components/ResultTable";
import { DemoNoticeModal } from "@/app/components/DemoNoticeModal";
import { REPORT_TYPES, type ReportType, type ResultTable as ResultTableType, type TeacherReport } from "@/lib/types";

const EXAMPLE_TEXT =
  "Mrs. Adeyemi here. Monday's Mathematics class with JSS 2A — we continued fractions. Most students understood adding fractions with the same denominator, but several students struggled when the denominators were different. I noticed that about 8 students need additional explanation. We also didn't finish the exercise because we spent extra time helping students understand the concept.";

type ChatMessage =
  | { id: string; role: "assistant"; kind: "greeting"; text: string }
  | { id: string; role: "assistant"; kind: "error"; text: string }
  | { id: string; role: "assistant"; kind: "typing"; label: string }
  | { id: string; role: "user"; kind: "text"; text: string; fileName?: string }
  | {
      id: string;
      role: "assistant";
      kind: "chat";
      text: string;
      readyToGenerate: boolean;
      previewTable?: ResultTableType;
    }
  | { id: string; role: "assistant"; kind: "result"; report: TeacherReport };

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function TeacherPage() {
  const [reportType, setReportType] = useState<ReportType>("Lesson Report");

  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [transcript, setTranscript] = useState<string[]>([]);
  const [canGenerate, setCanGenerate] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      kind: "greeting",
      text: "Hi! Just tell me what happened, the way you'd normally describe it — mention the class, subject, and date if you like, and I'll pick them up. You can also attach a report document (.docx, .pdf, .txt) instead of typing. Chat as much as you like, then click Generate Report when you're done.",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not read that file.");

      setInput(data.text);
      setAttachedFile(data.fileName);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          kind: "error",
          text: err instanceof Error ? err.message : "Could not read that file.",
        },
      ]);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function useExample() {
    setInput(EXAMPLE_TEXT);
    setAttachedFile(null);
  }

  async function handleSend() {
    if (!input.trim() || chatting || extracting || generating) return;

    const text = input.trim();
    const fileName = attachedFile ?? undefined;
    const nextTranscript = [...transcript, text];

    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", kind: "text", text, fileName },
      { id: uid(), role: "assistant", kind: "typing", label: "Thinking…" },
    ]);
    setTranscript(nextTranscript);
    setInput("");
    setAttachedFile(null);
    setChatting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, transcript: nextTranscript.join("\n") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setCanGenerate(data.readyToGenerate);
      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "typing"),
        {
          id: uid(),
          role: "assistant",
          kind: "chat",
          text: data.reply,
          readyToGenerate: data.readyToGenerate,
          previewTable: data.previewTable ?? undefined,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "typing"),
        {
          id: uid(),
          role: "assistant",
          kind: "error",
          text: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setChatting(false);
    }
  }

  async function handleGenerate() {
    if (transcript.length === 0 || generating || chatting) return;

    setMessages((m) => [
      ...m,
      { id: uid(), role: "assistant", kind: "typing", label: "Generating report…" },
    ]);
    setGenerating(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          reportText: transcript.join("\n\n"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const report: TeacherReport = data;
      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "typing"),
        { id: uid(), role: "assistant", kind: "result", report },
      ]);
      setTranscript([]);
      setCanGenerate(false);
    } catch (err) {
      setMessages((m) => [
        ...m.filter((msg) => msg.kind !== "typing"),
        {
          id: uid(),
          role: "assistant",
          kind: "error",
          text: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setGenerating(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-1 flex-col dark:bg-slate-950">
      <DemoNoticeModal />
      <Header active="teacher" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Submit a Report</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReportType(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                reportType === type
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onGenerate={handleGenerate} generating={generating} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="mt-3 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {attachedFile && (
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Paperclip className="h-3.5 w-3.5" /> {attachedFile}
              <button
                onClick={() => {
                  setAttachedFile(null);
                  setInput("");
                }}
                className="text-violet-400 hover:text-violet-700 dark:text-violet-500 dark:hover:text-violet-300"
                aria-label="Remove attachment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Describe what happened, or attach a report document…"
            className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-slate-900 focus:outline-none dark:text-slate-100"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {extracting ? (
                  "Reading…"
                ) : (
                  <>
                    <Paperclip className="h-3.5 w-3.5" /> Attach
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt,.md"
                  onChange={handleFileChange}
                  disabled={extracting}
                  className="hidden"
                />
              </label>
              <button
                onClick={useExample}
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Try example
              </button>
              {transcript.length > 0 && (
                <button
                  onClick={handleGenerate}
                  disabled={generating || chatting}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    canGenerate
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {generating ? (
                    "Generating…"
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Generate Report
                    </span>
                  )}
                </button>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatting || extracting || generating}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href="/headmaster"
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            View headmaster dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  onGenerate,
  generating,
}: {
  message: ChatMessage;
  onGenerate: () => void;
  generating: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2.5 text-sm text-white">
          {message.fileName && (
            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
              <Paperclip className="h-3 w-3" /> {message.fileName}
            </div>
          )}
          <p className="whitespace-pre-wrap leading-6">{message.text}</p>
        </div>
      </div>
    );
  }

  if (message.kind === "typing") {
    return (
      <div className="flex justify-start">
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
          {message.label}
        </div>
      </div>
    );
  }

  if (message.kind === "error") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === "greeting") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === "chat") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] rounded-2xl rounded-bl-sm bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{message.text}</p>
          {message.previewTable && (
            <div className="mt-3">
              <ResultTable table={message.previewTable} />
            </div>
          )}
          {message.readyToGenerate && (
            <button
              onClick={onGenerate}
              disabled={generating}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                "Generating…"
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Generate Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  const { report } = message;
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] rounded-2xl rounded-bl-sm bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="mb-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              {report.reportType}
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {report.className} — {report.subject}
            </p>
          </div>
          <StatusBadge status={report.structured.status} />
        </div>
        <div className="mt-3">
          <ResultTable table={report.structured.table} />
        </div>
        <a
          href={`/api/reports/${report.id}/document`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          <Download className="h-3.5 w-3.5" /> Download as Word document
        </a>
      </div>
    </div>
  );
}
