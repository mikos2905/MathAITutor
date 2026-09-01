import { NextResponse } from "next/server";
import { getQuestion } from "@/data/questions";
import { grade, graderMode } from "@/lib/grader";
import type { Attempt } from "@/lib/ib/types";

/**
 * Grading endpoint.
 *
 * This exists so the API key stays on the server. Calling Anthropic directly
 * from the browser would ship the key to anyone who opens devtools.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Attempt> & { questionId?: string };

    if (!body.questionId || !body.imageBase64) {
      return NextResponse.json(
        { error: "questionId and imageBase64 are required." },
        { status: 400 },
      );
    }

    const question = getQuestion(body.questionId);
    if (!question) {
      return NextResponse.json({ error: `Unknown question ${body.questionId}.` }, { status: 404 });
    }

    const attempt: Attempt = {
      questionId: body.questionId,
      imageBase64: body.imageBase64,
      imageMediaType: body.imageMediaType ?? "image/jpeg",
      secondsTaken: body.secondsTaken ?? 0,
      hintsUsed: body.hintsUsed ?? 0,
    };

    const verdict = await grade(question, attempt);
    return NextResponse.json({ verdict, mode: graderMode() });
  } catch (error) {
    console.error("[grade] failed:", error);
    const message = error instanceof Error ? error.message : "Grading failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
