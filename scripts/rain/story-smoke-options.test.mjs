import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {existsSync} from "node:fs";
import {mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {dirname, join} from "node:path";
import {test} from "node:test";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const helperPath = join(here, "story-smoke-options.mjs");

test("story smoke preflight protects history without starting a scan", async (t) => {
  // Gate all CLI execution: importing the old top-level driver would start a scan.
  assert.ok(existsSync(helperPath), "The safe preflight helper has not been implemented");
  const {
    assertNewOutput,
    parseSmokeArgs,
    readSourceInfo,
    reserveOutput,
    storiesFromIndex,
    writeNewJson,
  } = await import("./story-smoke-options.mjs");
  const temporary = await mkdtemp(join(tmpdir(), "rain-smoke-options-"));

  t.after(() => rm(temporary, {force: true, recursive: true}));

  await t.test("requires an explicit output and validates every argument", () => {
    assert.throws(() => parseSmokeArgs([]), /--output/);
    assert.deepEqual(parseSmokeArgs(["--output", "new-evidence"], {cwd: temporary, env: {}}), {
      base: "http://127.0.0.1:6006",
      concurrency: 1,
      help: false,
      output: join(temporary, "new-evidence"),
      plan: false,
    });
    for (const value of ["0", "4", "1.5", "-1", "NaN", "01", "2e0", ""]) {
      assert.throws(() => parseSmokeArgs(["--output", "x", "--concurrency", value]));
    }
    for (const args of [
      ["--unknown"],
      ["--output"],
      ["--output", "--plan"],
      ["--output", "x", "--concurrency"],
      ["--output", "x", "--output", "y"],
      ["--output", "x", "--concurrency", "2", "--concurrency", "3"],
      ["--output", "x", "unexpected"],
      ["--help", "--unknown"],
    ])
      assert.throws(() => parseSmokeArgs(args));
    for (const concurrency of [1, 2, 3])
      assert.equal(
        parseSmokeArgs(["--output", "x", "--concurrency", String(concurrency)]).concurrency,
        concurrency,
      );
    assert.equal(
      parseSmokeArgs(["--output", "x"], {env: {STORYBOOK_URL: "http://localhost:7777"}}).base,
      "http://localhost:7777",
    );
    assert.equal(parseSmokeArgs(["--help"]).help, true);
    assert.equal(parseSmokeArgs(["--output", "x", "--plan"]).plan, true);
  });

  await t.test(
    "rejects existing empty directories, files and symlinks without modifying them",
    async () => {
      const empty = join(temporary, "empty");
      const file = join(temporary, "existing.json");
      const link = join(temporary, "link");
      const dangling = join(temporary, "dangling");

      await mkdir(empty);
      await writeFile(file, "preserve me");
      await symlink(empty, link);
      await symlink(join(temporary, "missing"), dangling);
      for (const existing of [empty, file, link, dangling]) {
        await assert.rejects(assertNewOutput(existing), /exists/i);
        await assert.rejects(reserveOutput(existing));
      }
      assert.deepEqual(await readdir(empty), []);
      assert.equal(await readFile(file, "utf8"), "preserve me");
    },
  );

  await t.test("reserves a new directory once and writes reports exclusively", async () => {
    const output = join(temporary, "reserved");

    await assertNewOutput(output);
    assert.equal(existsSync(output), false);
    const attempts = await Promise.allSettled([reserveOutput(output), reserveOutput(output)]);

    assert.equal(attempts.filter(({status}) => status === "fulfilled").length, 1);
    assert.equal(attempts.filter(({status}) => status === "rejected").length, 1);
    const report = join(output, "story-smoke.json");

    await writeNewJson(report, {status: "not_run"});
    await assert.rejects(writeNewJson(report, {status: "pass"}), {code: "EEXIST"});
    assert.deepEqual(JSON.parse(await readFile(report, "utf8")), {status: "not_run"});
    const target = join(temporary, "protected.json");
    const linkedReport = join(output, "linked.json");

    await writeFile(target, "unchanged");
    await symlink(target, linkedReport);
    await assert.rejects(writeNewJson(linkedReport, {status: "pass"}), {code: "EEXIST"});
    assert.equal(await readFile(target, "utf8"), "unchanged");
  });

  await t.test(
    "records actual limited source hashes and labels inventory as recorded input",
    async () => {
      const source = await readSourceInfo(root);

      for (const file of [
        "packages/rain-theme/index.css",
        "pnpm-lock.yaml",
        "packages/react/src/components/tabs/tabs.tsx",
        "packages/styles/src/components/tabs/tabs.styles.ts",
      ]) {
        const expected = createHash("sha256")
          .update(await readFile(join(root, file)))
          .digest("hex");

        assert.equal(source.actualSha256[file], expected);
      }
      const inventory = JSON.parse(await readFile(join(root, "docs/rain/inventory.json"), "utf8"));

      assert.equal(source.inventory.kind, "recorded_input_summary_not_new_freeze");
      assert.equal(source.inventory.declaredInputSha256, inventory.upstream.inputSha256);
      assert.equal(source.inventory.declaredInputFiles, inventory.upstream.inputFiles);
      assert.equal(source.versions["@heroui/react"], "3.2.6");
      assert.equal(source.versions["@rain-classroom/heroui-theme"], "0.1.2");
    },
  );

  await t.test("rejects malformed or empty indexes instead of passing zero stories", () => {
    for (const index of [
      null,
      {},
      {entries: []},
      {entries: {}},
      {entries: {a: {type: "docs"}}},
      {entries: {a: {id: "", type: "story"}}},
    ])
      assert.throws(() => storiesFromIndex(index));
    const story = {id: "example--basic", title: "Example", type: "story"};

    assert.deepEqual(storiesFromIndex({entries: {a: story, b: {type: "docs"}}}), [story]);
  });

  await t.test("help and plan return before network, Playwright or output creation", async () => {
    // A tiny built-in preload makes accidental scanning fail before browser launch.
    const guard = join(temporary, "no-scan.cjs");

    await writeFile(
      guard,
      `
      const Module = require("node:module");
      const originalLoad = Module._load;
      globalThis.fetch = () => { throw new Error("Network is forbidden in preflight"); };
      Module._load = function(specifier, ...args) {
        if (specifier.includes("playwright")) throw new Error("Playwright is forbidden in preflight");
        return originalLoad.call(this, specifier, ...args);
      };
    `,
    );
    const invoke = (args) =>
      spawnSync(process.execPath, ["--require", guard, join(here, "story-smoke.mjs"), ...args], {
        cwd: temporary,
        encoding: "utf8",
        env: {...process.env, STORYBOOK_URL: "http://127.0.0.1:1"},
        timeout: 5000,
      });
    const help = invoke(["--help"]);

    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /--output/);
    const output = join(temporary, "plan-only");
    const before = await readdir(temporary);
    const plan = invoke(["--output", output, "--concurrency", "2", "--plan"]);

    assert.equal(plan.status, 0, plan.stderr);
    const result = JSON.parse(plan.stdout);

    assert.equal(result.status, "not_run");
    assert.equal(result.config.output, output);
    assert.equal(result.config.concurrency, 2);
    assert.equal(result.config.base, "http://127.0.0.1:1");
    assert.ok(result.source.actualSha256["packages/rain-theme/index.css"]);
    assert.equal(existsSync(output), false);
    assert.deepEqual(await readdir(temporary), before);
    const invalid = invoke(["--output", output, "--concurrency", "9", "--plan"]);

    assert.notEqual(invalid.status, 0);
    assert.equal(existsSync(output), false);
    const existing = invoke(["--output", join(temporary, "empty"), "--plan"]);

    assert.notEqual(existing.status, 0);
    assert.deepEqual(await readdir(join(temporary, "empty")), []);
  });
});
