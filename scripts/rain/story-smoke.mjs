/* global document, getComputedStyle */
import {createHash} from "node:crypto";
import {open, writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {
  assertNewOutput,
  parseSmokeArgs,
  readSourceInfo,
  reserveOutput,
  storiesFromIndex,
  writeNewJson,
} from "./story-smoke-options.mjs";

async function renderStories(browser, stories, config, results) {
  let next = 0;
  const workers = await Promise.allSettled(
    Array.from({length: config.concurrency}, async () => {
      const page = await browser.newPage({viewport: {height: 1000, width: 1440}});
      let errors = [];

      page.on("pageerror", (error) => errors.push(error.message));
      try {
        while (next < stories.length) {
          const story = stories[next++];

          errors = [];
          try {
            await page.goto(
              `${config.base}/iframe.html?id=${story.id}&viewMode=story&globals=heroui-theme:rain-light`,
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
              status:
                errors.length || sample.error || sample.brand !== "#1561f8" ? "review" : "pass",
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
      } finally {
        await page.close();
      }
    }),
  );
  const failed = workers.find((worker) => worker.status === "rejected");

  if (failed) throw failed.reason;
}

async function main() {
  const config = parseSmokeArgs(process.argv.slice(2));

  if (config.help) {
    process.stdout.write(
      "Usage: node scripts/rain/story-smoke.mjs --output <new-directory> [--concurrency <1|2|3>] [--plan]\n" +
        "The output parent must exist. Existing output paths are rejected. Default concurrency: 1.\n" +
        "--help and --plan do not fetch pages, load Playwright, or create scan output.\n" +
        "STORYBOOK_URL keeps its existing meaning (default http://127.0.0.1:6006).\n",
    );

    return;
  }
  await assertNewOutput(config.output);
  const source = await readSourceInfo(fileURLToPath(new URL("../../", import.meta.url)));

  if (config.plan) {
    process.stdout.write(`${JSON.stringify({config, source, status: "not_run"}, null, 2)}\n`);

    return;
  }
  await reserveOutput(config.output);
  const run = {
    command: [process.execPath, ...process.argv.slice(1)],
    config,
    endedAt: null,
    index: null,
    node: process.version,
    source,
    startedAt: new Date().toISOString(),
    status: "running",
  };
  // Keep this exclusively created handle; only this run can update its metadata.
  const runFile = await open(resolve(config.output, "run.json"), "wx");
  const saveRun = async () => {
    await runFile.truncate(0);
    await runFile.write(`${JSON.stringify(run, null, 2)}\n`, 0, "utf8");
  };
  let browser;
  let failure;
  let stories = [];
  const results = [];

  try {
    await saveRun();
    try {
      const response = await fetch(`${config.base}/index.json`);

      if (!response.ok) throw new Error(`Storybook index request failed: HTTP ${response.status}`);
      const indexText = await response.text();

      await writeFile(resolve(config.output, "index.json"), indexText, {flag: "wx"});
      run.index = {
        file: "index.json",
        sha256: createHash("sha256").update(indexText).digest("hex"),
        storyCount: 0,
      };
      stories = storiesFromIndex(JSON.parse(indexText));
      run.index.storyCount = stories.length;
      await saveRun();
      const require = createRequire(
        new URL("../../packages/testing/package.json", import.meta.url),
      );
      const {chromium} = require("playwright");

      browser = await chromium.launch({headless: true});
      await renderStories(browser, stories, config, results);
    } catch (error) {
      failure = error;
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          failure ??= error;
        }
      }
    }
    results.sort((a, b) => a.id.localeCompare(b.id));
    const passed = results.filter((result) => result.status === "pass").length;

    run.status = failure
      ? "failed"
      : stories.length > 0 && passed === stories.length && results.length === stories.length
        ? "passed"
        : "review";
    if (failure) run.error = failure.stack ?? String(failure);
    const report = {
      expected: stories.length,
      generatedAt: new Date().toISOString(),
      passed,
      results,
      scope:
        "Initial render with actual Rain CSS; does not exercise every story interaction or externally hosted media",
      status: run.status,
      total: results.length,
      ...(failure ? {error: run.error} : {}),
    };

    await writeNewJson(resolve(config.output, "story-smoke.json"), report);
    process.stdout.write(
      `${JSON.stringify({
        expected: report.expected,
        passed,
        review: results
          .filter((result) => result.status !== "pass")
          .map(({errors, id, message}) => ({errors, id, message})),
        status: run.status,
        total: report.total,
      })}\n`,
    );
    process.exitCode = run.status === "passed" ? 0 : 1;
  } catch (error) {
    run.status = "failed";
    run.error = error.stack ?? String(error);
    throw error;
  } finally {
    run.endedAt = new Date().toISOString();
    try {
      await saveRun();
    } finally {
      await runFile.close();
    }
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
