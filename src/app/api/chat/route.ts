import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import mammoth from "mammoth";

export const runtime = "edge";

const client = new Groq({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") as string;
    const file = formData.get("file") as File | null;

    let extractedText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith(".pdf")) {
        const pdfModule = await import("pdf-parse");
        const pdfFunc = pdfModule as unknown as (data: Buffer) => Promise<{ text: string }>;
        const data = await pdfFunc(buffer);
        extractedText = data.text;
      } else if (file.name.endsWith(".docx")) {
        const { value } = await mammoth.extractRawText({ buffer });
        extractedText = value;
      }
    }

    const prompt = extractedText
      ? `Analyze this document:\n${extractedText}\n\nUser question: ${message}`
      : message;

    const messagesForAI = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. You can answer in English or Indonesian depending on user input."
      },
      { role: "user", content: prompt }
    ] as const;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: Array.from(messagesForAI),
      stream: true
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
