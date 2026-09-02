import { NextResponse } from "next/server";
import { getQuestion } from "@/data/questions";
import { checkRecall } from "@/lib/recall";
import { recordRecall } from "@/lib/student/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { questionId?: string; explanation?: string };

    if (!body.questionId || typeof body.explanation !== "string") {
      return NextResponse.json(
        { error: "questionId and explanation are required." },
        { status: 400 },
      );
    }

    const question = getQuestion(body.questionId);
    if (!question) {
      return NextResponse.json({ error: `Unknown question ${body.questionId}.` }, { status: 404 });
    }

    const verdict = await checkRecall(question, body.explanation);

    try {
      await recordRecall(question.id, verdict.grade);
    } catch (recordError) {
      console.error("[explain] verdict produced but not recorded:", recordError);
    }

    return NextResponse.json({ verdict });
  } catch (error) {
    console.error("[explain] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recall check failed." },
      { status: 500 },
    );
  }
}
