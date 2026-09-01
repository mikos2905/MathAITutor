/**
 * Downscale a photo in the browser before it is ever uploaded.
 *
 * Claude bills images as ceil(w/28) x ceil(h/28) visual tokens. A raw 12 MP
 * phone photo hits the model's cap at 4,784 tokens; resizing to a 1600px long
 * edge costs around 2,500 and is still comfortably legible for handwriting.
 * That is roughly half the image cost of every single grade, for free.
 */
const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.85;

export interface PreparedImage {
  /** Base64 payload with the data: prefix stripped, ready for the API. */
  base64: string;
  mediaType: "image/jpeg";
  /** For a preview in the UI. */
  dataUrl: string;
  width: number;
  height: number;
  /** Estimated visual tokens, so the cost is visible rather than mysterious. */
  estimatedTokens: number;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context to resize the image.");

  // White backdrop: JPEG has no alpha, and a transparent PNG would otherwise
  // composite onto black and hide pencil working.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

  return {
    base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    mediaType: "image/jpeg",
    dataUrl,
    width,
    height,
    estimatedTokens: Math.ceil(width / 28) * Math.ceil(height / 28),
  };
}
