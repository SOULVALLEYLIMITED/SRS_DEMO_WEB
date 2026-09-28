const MAX_FILE_BYTES = 8 * 1024 * 1024;

export class ExtractionError extends Error {}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new ExtractionError("File is too large (max 8MB).");
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }

  if (name.endsWith(".pdf")) {
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text.trim();
  }

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return buffer.toString("utf-8").trim();
  }

  throw new ExtractionError(
    "Unsupported file type. Please upload a .docx, .pdf, .txt, or .md file."
  );
}
