import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, ExtractionError } from "@/lib/extractText";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  try {
    const text = await extractTextFromFile(file);
    if (!text) {
      return NextResponse.json(
        { error: "No readable text was found in that file." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text, fileName: file.name });
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Text extraction failed:", err);
    return NextResponse.json(
      { error: "Could not read that file. Please try a different one." },
      { status: 500 }
    );
  }
}
