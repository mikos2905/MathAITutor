/**
 * End-to-end check of the whole prototype in a real browser.
 *
 * Covers the paths that unit tests cannot: the photo upload and downscale,
 * the hint gating, the recall check hiding the marking, and history and
 * recommendations reacting to a newly stored attempt.
 *
 *   npm run build && npm start          # in one terminal
 *   npm run e2e                          # in another
 *
 * Needs a Chromium: `npx playwright install chromium`, or set
 * PLAYWRIGHT_CHROMIUM to the path of one you already have.
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;

const fails = [];
const check = (name, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) fails.push(name);
};

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 860, height: 1200 } });

// --- home page ------------------------------------------------------------
await page.goto(BASE, { waitUntil: "networkidle" });
check("home shows a 'Start here' recommendation block", await page.getByText("Start here").first().isVisible());

const recBlock = page.locator("section").filter({ hasText: "Start here" });
const firstRec = recBlock.locator("a").first();
const firstRecText = await firstRec.innerText();
// Every recommendation must explain itself: a title and badge alone is not advice.
check(
  "recommendations explain themselves in a full sentence",
  firstRecText.trim().endsWith(".") && firstRecText.length > 40,
);
check("every question is listed", (await page.locator("a[href^='/practice/']").count()) >= 10);

// --- a full attempt -------------------------------------------------------
await page.goto(`${BASE}/practice/aahl-calc-003`, { waitUntil: "networkidle" });
check("a Paper 2 question says the GDC is allowed", await page.getByText("GDC allowed").first().isVisible());
await page.getByRole("button", { name: "Start attempt" }).click();

const ladder = page.locator("div").filter({ hasText: /^Stuck on \(a\)\?/ }).first();
await ladder.getByRole("button", { name: /Orient/ }).click();
await page.waitForTimeout(100);
await ladder.getByRole("button", { name: /Nudge/ }).click();
await page.waitForTimeout(100);
check("hint use is counted", await ladder.getByText("2 of 5 hints used").isVisible());
check(
  "a hint that does the maths is still gated",
  await ladder.getByRole("button", { name: /Strategy/ }).isVisible(),
);

await page.locator("input[type=file]").setInputFiles(path.join(here, "fixtures", "working.png"));
await page.waitForTimeout(600);
const tokenText = await page.getByText(/image tokens/).innerText();
const tokens = Number(tokenText.match(/~([\d,]+)/)[1].replace(/,/g, ""));
// The model caps a full-resolution photo at 4784 visual tokens; downscaling
// before upload should keep us comfortably under that on every grade.
check(`photo downscaled below the token cap (${tokens} < 4784)`, tokens < 4784);

await page.getByRole("button", { name: "Submit for marking" }).click();
await page.getByText("Fix this next").first().waitFor({ timeout: 30000 });
check("mark breakdown renders", await page.getByText("Mark by mark").first().isVisible());

// --- explain it back ------------------------------------------------------
await page.getByRole("button", { name: "Start recall check" }).click();
await page.waitForTimeout(200);
check(
  "the marking is hidden while the explanation is written",
  !(await page.getByText("Mark by mark").first().isVisible().catch(() => false)),
);
await page.locator("textarea").fill(
  "Set velocity to zero to find when it turns round, then integrate velocity over each interval separately and add the absolute values, because total distance is not displacement when the particle reverses.",
);
await page.getByRole("button", { name: "Check my explanation" }).click();
await page
  .getByText(/could redo this unaided|would get stuck|has not landed/i)
  .first()
  .waitFor({ timeout: 30000 });
check("recall verdict returned", true);
check("the marking comes back afterwards", await page.getByText("Mark by mark").first().isVisible());

// --- history --------------------------------------------------------------
await page.goto(`${BASE}/history`, { waitUntil: "networkidle" });
// .first() throughout: this runs against whatever history you already have,
// so anything that could match more than once must say which one it means.
check(
  "the attempt appears in history",
  await page.getByText("Kinematics: displacement versus distance").first().isVisible(),
);
await page.getByRole("button", { name: "Re-read the marking" }).first().click();
await page.waitForTimeout(300);
check("past marking can be re-read in full", await page.getByText("Mark by mark").first().isVisible());

// --- profile --------------------------------------------------------------
await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
check("profile shows the diagnosis", await page.getByText("Where your marks actually go").first().isVisible());
check("profile shows the recall tally", await page.getByText("Recall", { exact: true }).first().isVisible());

// --- the history feeds back into the recommendations ----------------------
await page.goto(BASE, { waitUntil: "networkidle" });
const recs = await page.locator("section").filter({ hasText: "Start here" }).locator("a").allInnerTexts();
check(
  "a just-attempted question is no longer the top recommendation",
  !recs[0].includes("Kinematics: displacement versus distance"),
);
check("the question is marked as attempted", await page.getByText("attempted").first().isVisible());

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(", ")}` : "\nall checks passed");
process.exit(fails.length ? 1 : 0);
