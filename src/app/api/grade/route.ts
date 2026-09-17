import { NextResponse } from "next/server";
import { getQuestion } from "@/data/questions";
import { grade, graderMode } from "@/lib/grader";
import { reconcileVerdict, reconcileChangedSomething } from "@/lib/grader/reconcile";
import { loadModel, recordAttempt } from "@/lib/student/store";
import type { Attempt, AttemptImage } from "@/lib/ib/types";

/**
 * Grading endpoint.
 *
 * This exists so the API key stays on the server. Calling Anthropic directly
 * from the browser would ship the key to anyone who opens devtools.
 */

const MAX_PAGES = 8;
// The API accepts 10 MB per image; a client-resized page is ~200 KB, so
// anything near this limit means the resize did not happen.
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateImages(input: unknown): AttemptImage[] | string {
  if (!Array.isArray(input) || input.length === 0) return "At least one page is required.";
  if (input.length > MAX_PAGES) return `At most ${MAX_PAGES} pages per attempt.`;

  const images: AttemptImage[] = [];
  for (const [i, item] of input.entries()) {
    const base64 = typeof item?.base64 === "string" ? item.base64 : "";
    const mediaType = typeof item?.mediaType === "string" ? item.mediaType : "";
    if (!base64) return `Page ${i + 1} has no image data.`;
    if (!MEDIA_TYPES.has(mediaType)) return `Page ${i + 1} has an unsupported image type.`;
    // Base64 inflates by 4/3; this is close enough to catch an un-resized upload.
    if (base64.length * 0.75 > MAX_IMAGE_BYTES) return `Page ${i + 1} is too large.`;
    images.push({ base64, mediaType: mediaType as AttemptImage["mediaType"] });
  }
  return images;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      questionId?: string;
      images?: unknown;
      secondsTaken?: number;
      hintUsage?: Attempt["hintUsage"];
    };

    if (!body.questionId) {
      return NextResponse.json({ error: "questionId is required." }, { status: 400 });
    }
    const question = getQuestion(body.questionId);
    if (!question) {
      return NextResponse.json({ error: `Unknown question ${body.questionId}.` }, { status: 404 });
    }

    const images = validateImages(body.images);
    if (typeof images === "string") {
      return NextResponse.json({ error: images }, { status: 400 });
    }

    const attempt: Attempt = {
      questionId: question.id,
      images,
      secondsTaken: Math.max(0, Math.floor(body.secondsTaken ?? 0)),
      hintUsage: body.hintUsage ?? [],
    };

    const model = await loadModel();
    const raw = await grade(question, attempt, model);

    // The model judges; the rubric keeps the books.
    const { verdict, report } = reconcileVerdict(question, raw);
    if (reconcileChangedSomething(report)) {
      console.warn("[grade] reconciled verdict drift:", JSON.stringify(report));
    }

    // Persist after grading, so this attempt feeds the next one's context.
    // A failure to record must not lose the student their feedback.
    try {
      await recordAttempt(question, attempt, verdict);
    } catch (recordError) {
      console.error("[grade] verdict was produced but could not be recorded:", recordError);
    }

    return NextResponse.json({ verdict, mode: graderMode() });
  } catch (error) {
    console.error("[grade] failed:", error);
    const message = error instanceof Error ? error.message : "Grading failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
