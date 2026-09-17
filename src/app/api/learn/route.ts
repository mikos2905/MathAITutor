import { NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import { explain, questionsForLesson } from "@/lib/learn";
import { loadModel, recordLesson } from "@/lib/student/store";

const MAX_REQUEST_CHARS = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { request?: string };
    const text = (body.request ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Say what you want explained." }, { status: 400 });
    }
    if (text.length > MAX_REQUEST_CHARS) {
      return NextResponse.json(
        { error: `Keep the request under ${MAX_REQUEST_CHARS} characters.` },
        { status: 400 },
      );
    }

    const model = await loadModel();
    const lesson = await explain(text, model);
    const practise = questionsForLesson(lesson, QUESTIONS, model).map((q) => ({
      id: q.id,
      title: q.title,
      paper: q.paper,
      totalMarks: q.totalMarks,
      exactMatch: q.concepts.some((c) => c.toLowerCase() === lesson.concept.toLowerCase()),
    }));

    try {
      await recordLesson(lesson.concept, lesson.topic);
    } catch (recordError) {
      console.error("[learn] lesson produced but not recorded:", recordError);
    }

    return NextResponse.json({ lesson, practise });
  } catch (error) {
    console.error("[learn] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Explanation failed." },
      { status: 500 },
    );
  }
}
