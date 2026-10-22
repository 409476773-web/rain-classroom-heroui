/* global document, getComputedStyle */
import {mkdir, writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {resolve} from "node:path";

const require = createRequire(new URL("../../packages/testing/package.json", import.meta.url));
const {chromium} = require("playwright");

const base = process.env.STORYBOOK_URL || "http://127.0.0.1:6006";
const output = resolve("evidence/runtime/rain-theme-state-audit-2026-10-19");
const index = await fetch(`${base}/index.json`).then((response) => response.json());
const stories = Object.values(index.entries).filter((entry) => entry.type === "story");
const results = [];
const browser = await chromium.launch({headless: true});
let next = 0;

await mkdir(output, {recursive: true});
try {
  await Promise.all(
    Array.from({length: 3}, async () => {
      const page = await browser.newPage({viewport: {height: 1000, width: 1440}});
      let errors = [];

      page.on("pageerror", (error) => errors.push(error.message));
      while (next < stories.length) {
        const story = stories[next++];

        errors = [];
        try {
          await page.goto(
            `${base}/iframe.html?id=${story.id}&viewMode=story&globals=heroui-theme:rain-light`,
            {waitUntil: "domcontentloaded"},
          );
          await page.waitForFunction(
            () =>
              document.documentElement.dataset.rainTheme === "light" &&
              document.body.classList.contains("sb-show-main") &&
              document.querySelector("#storybook-root")?.children.length > 0,
            null,
            {timeout: 20000},
          );
          const sample = await page.evaluate(() => ({
            brand: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
            disabled: document.querySelectorAll('[disabled], [data-disabled="true"]').length,
            error: document.querySelector(".sb-errordisplay")?.checkVisibility()
              ? document.querySelector(".sb-errordisplay").textContent.trim()
              : null,
            font: getComputedStyle(document.body).fontFamily,
            invalid: document.querySelectorAll('[aria-invalid="true"], [data-invalid="true"]')
              .length,
            slots: [
              ...new Set(
                [...document.querySelectorAll("[data-slot]")].map((el) =>
                  el.getAttribute("data-slot"),
                ),
              ),
            ],
          }));

          results.push({
            id: story.id,
            status: errors.length || sample.error || sample.brand !== "#1561f8" ? "review" : "pass",
            title: story.title,
            ...sample,
            errors: [...errors],
          });
        } catch (error) {
          results.push({
            errors: [...errors],
            id: story.id,
            message: error.message,
            status: "review",
            title: story.title,
          });
        }
        if (results.length % 50 === 0)
          process.stdout.write(`Rendered ${results.length}/${stories.length}\n`);
      }
      await page.close();
    }),
  );
} finally {
  await browser.close();
}
results.sort((a, b) => a.id.localeCompare(b.id));
const report = {
  generatedAt: new Date().toISOString(),
  passed: results.filter((r) => r.status === "pass").length,
  results,
  scope:
    "Initial render with actual Rain CSS; does not exercise every story interaction or externally hosted media",
  total: results.length,
};

await writeFile(resolve(output, "story-smoke.json"), JSON.stringify(report, null, 2) + "\n");
process.stdout.write(
  JSON.stringify({
    passed: report.passed,
    review: results
      .filter((r) => r.status !== "pass")
      .map(({errors, id, message}) => ({errors, id, message})),
    total: report.total,
  }) + "\n",
);
process.exitCode = report.passed === report.total ? 0 : 1;
