import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";

import {
  analyzeSource,
  generateInventory,
  parseDemoRegistry,
  parseDocument,
  reconcileStorybook,
} from "./inventory.mjs";

test("parses generic TypeScript functions as TS rather than JSX", () => {
  const result = analyzeSource("queue.ts", "export const queue = <T>(value: T): T => value;");

  assert.ok(result.exports.some((item) => item.name === "queue"));
});

test("reads default Storybook metadata and bound template story exports", () => {
  const result = analyzeSource(
    "button.stories.tsx",
    `
    export default {title: "Components/Button"} as Meta;
    export const Default = Template.bind({});
    export const Controlled = () => <Button />;
  `,
  );

  assert.equal(result.storyTitle, "Components/Button");
  assert.deepEqual(result.storyExports, ["Default", "Controlled"]);
});

test("records a dynamic import so registered no-SSR wrappers are distinguished from missing sources", () => {
  const result = analyzeSource(
    "wrapper.tsx",
    `
    export const Format = dynamic(() => import("./format").then((m) => m.Format), {ssr: false});
  `,
  );

  assert.deepEqual(result.dynamicImports, ["./format"]);
});

test("built Storybook IDs are matched by source file and export, including missing stories", () => {
  const source = [
    {
      exportNames: ["Basic", "Disabled"],
      file: "packages/react/src/components/button/button.stories.tsx",
      title: "Components/Button",
    },
  ];
  const built = {
    entries: {
      "actual-button-basic": {
        exportName: "Basic",
        id: "actual-button-basic",
        importPath: "../react/src/components/button/button.stories.tsx",
        title: "Components/Button",
        type: "story",
      },
    },
  };
  const result = reconcileStorybook(source, built);

  assert.equal(result.status, "mismatch");
  assert.equal(result.entries[0].file, source[0].file);
  assert.equal(result.entries[0].id, "actual-button-basic");
  assert.deepEqual(result.missing, [{exportName: "Disabled", file: source[0].file}]);
});

test("tracks aliases, type-only exports, star exports, and compound members", () => {
  const result = analyzeSource(
    "sample.tsx",
    `
    import {Root, Header as LocalHeader} from "./parts";
    export const Card = Object.assign(Root, {Root, Header: LocalHeader});
    export type Card = {Props: unknown};
    export {Root as CardRoot, type HeaderProps} from "./parts";
    export * from "./helpers";
    export * as Nested from "./nested";
  `,
  );

  assert.ok(result.exports.some((item) => item.name === "CardRoot" && item.localName === "Root"));
  assert.ok(result.exports.some((item) => item.name === "HeaderProps" && item.kind === "type"));
  assert.ok(result.exports.some((item) => item.name === "Card" && item.kind === "value"));
  assert.ok(result.exports.some((item) => item.name === "Card" && item.kind === "type"));
  assert.deepEqual(
    result.exportStars.map((item) => item.source),
    ["./helpers"],
  );
  assert.deepEqual(
    result.compound[0].members.map((item) => item.name),
    ["Root", "Header"],
  );
});

test("registry keeps loader and displayed source independently so mismatches are detectable", () => {
  const rows = parseDemoRegistry(
    "apps/docs/src/demos/en/index.ts",
    `
    export const demos: Record<string, DemoItem> = {
      "card-basic": {
        loader: () => import("./card/basic").then((module) => module.Basic),
        file: "en/card/other.tsx",
      },
    };
  `,
  );

  assert.deepEqual(
    rows.map(({id, loaderExport, loaderSpecifier, sourceFile}) => ({
      id,
      loaderExport,
      loaderSpecifier,
      sourceFile,
    })),
    [
      {
        id: "card-basic",
        loaderExport: "Basic",
        loaderSpecifier: "./card/basic",
        sourceFile: "en/card/other.tsx",
      },
    ],
  );
});

test("MDX references ignore fenced code examples and retain multiline previews and source views", () => {
  const result = parseDocument(
    "apps/docs/content/docs/cn/react/components/(layout)/card.mdx",
    `---
title: Card
links:
  source: card/card.tsx
  styles: card.css
---
<ComponentPreview\n name="card-basic" />
<ComponentSource name={"card-source"} />
\`\`\`tsx
<ComponentPreview name="not-a-live-demo" />
\`\`\`
`,
  );

  assert.deepEqual(result.demoIds, ["card-basic", "card-source"]);
  assert.equal(result.locale, "zh");
  assert.equal(result.repositoryLocale, "cn");
  assert.equal(result.route, "/cn/docs/react/components/card");
  assert.equal(result.sourceLink, "card/card.tsx");
});

test("maps parent implementation evidence without claiming runtime or visual acceptance", () => {
  const inventory = generateInventory(fileURLToPath(new URL("../../", import.meta.url)));
  const listBoxItem = inventory.modules.find((module) => module.id === "list-box-item");

  assert.ok(listBoxItem.referencedByModules.some((reference) => reference.module === "list-box"));
  assert.ok(listBoxItem.coverage.parentStoryReferences > 0);
  assert.equal(listBoxItem.verification.runtime, "not_run");
  assert.ok(
    ["not_checked", "matched", "mismatch"].includes(inventory.verification.builtStorybookIndex),
  );
  assert.ok(inventory.demos.some((demo) => demo.loaderMode === "source-via-wrapper"));
  assert.ok(inventory.unregisteredDemoFiles.every((row) => !row.file.endsWith("-no-ssr.tsx")));
});

function inventoryFixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "rain-inventory-"));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    writeFileSync(path.join(root, file), text);
  };
  const git = (...args) => execFileSync("git", args, {cwd: root, encoding: "utf8"}).trim();

  t.after(() => rmSync(root, {recursive: true, force: true}));
  for (const [file, text] of Object.entries({
    "AGENTS.md": "Fixture\n",
    ".gitignore": ".rollup.cache/\n.turbo/\n__screenshots__/\n*.tsbuildinfo\n",
    "package.json": '{"private":true}\n',
    "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    "packages/react/package.json": '{"version":"3.2.6"}\n',
    "packages/react/src/index.ts": 'export * from "./components";\n',
    "packages/react/src/components/index.ts": "export {};\n",
    "apps/docs/src/demos/en/index.ts": "export const demos = {};\n",
    "apps/docs/src/demos/cn/index.ts": "export const demos = {};\n",
  }))
    write(file, text);
  git("init", "--quiet");
  git("config", "user.name", "Inventory fixture");
  git("config", "user.email", "fixture@example.com");
  git("add", ".");
  git("commit", "--quiet", "-m", "chore: fixture baseline");
  const commit = git("rev-parse", "HEAD");

  write("docs/rain/upstream.json", JSON.stringify({commit}));
  return {root, write, git, commit};
}

test("local ignored caches and screenshots do not change source input identity", (t) => {
  const fixture = inventoryFixture(t);
  const before = generateInventory(fixture.root).upstream;

  fixture.write("packages/styles/.rollup.cache/output.js", "cached build");
  fixture.write("packages/styles/.turbo/task.json", "cached task");
  fixture.write("packages/react/tests/__screenshots__/state.png", "cached screenshot");
  fixture.write("packages/styles/tsconfig.tsbuildinfo", "cached typecheck");
  const after = generateInventory(fixture.root).upstream;

  assert.equal(after.inputFiles, before.inputFiles);
  assert.equal(after.inputSha256, before.inputSha256);
});

test("fixed upstream identity does not follow a new Git index or publication commit", (t) => {
  const fixture = inventoryFixture(t);
  const before = generateInventory(fixture.root).upstream;

  fixture.write("publication-note.md", "Local publication addition");
  fixture.git("add", "publication-note.md");
  const staged = generateInventory(fixture.root).upstream;

  assert.equal(staged.trackedFiles, before.trackedFiles);
  fixture.git("commit", "--quiet", "-m", "docs: publication fixture");
  const committed = generateInventory(fixture.root).upstream;

  assert.notEqual(fixture.git("rev-parse", "HEAD"), fixture.commit);
  assert.equal(committed.commit, fixture.commit);
  assert.equal(committed.trackedFiles, before.trackedFiles);
});

test("historical index fallback preserves the nine-story gap and never verifies a current build", (t) => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const fixture = inventoryFixture(t);
  const recorded = JSON.parse(readFileSync(path.join(root, "docs/rain/inventory.json"), "utf8"));

  for (const story of recorded.stories) {
    fixture.write(
      story.file,
      `export default {title: ${JSON.stringify(story.title)}};\n${story.exportNames
        .map((name) => `export const ${name} = () => null;`)
        .join("\n")}`,
    );
  }
  fixture.write(
    "docs/rain/storybook-baseline-index.json",
    readFileSync(path.join(root, "docs/rain/storybook-baseline-index.json"), "utf8"),
  );
  const inventory = generateInventory(fixture.root);

  assert.equal(inventory.builtStorybook.provenance, "historical-reference");
  assert.equal(inventory.builtStorybook.file, "docs/rain/storybook-baseline-index.json");
  assert.equal(inventory.builtStorybook.currentProductionVerified, false);
  assert.equal(inventory.summary.builtStories, 587);
  assert.equal(inventory.summary.staticStoryExports, 596);
  assert.equal(inventory.builtStorybook.status, "mismatch");
  assert.equal(inventory.issues.filter((issue) => issue.code === "missing_built_story").length, 9);
  assert.ok(inventory.stories.some((story) => story.idStatus === "read-from-historical-index"));
  fixture.write("packages/storybook/storybook-static/index.json", '{"entries":{}}');
  const actual = generateInventory(fixture.root).builtStorybook;

  assert.equal(actual.file, "packages/storybook/storybook-static/index.json");
  assert.equal(actual.provenance, "actual-built-index");
  assert.equal(actual.currentProductionVerified, false);
});

test("published source snapshot preserves official identity without requiring upstream ancestry", (t) => {
  const fixture = inventoryFixture(t);
  const expected = generateInventory(fixture.root).upstream;
  const officialCommit = "f".repeat(40);

  fixture.write(
    "docs/rain/upstream.json",
    JSON.stringify({
      commit: officialCommit,
      localSourceSnapshot: {commit: fixture.commit},
    }),
  );
  let inventory;

  assert.doesNotThrow(() => {
    inventory = generateInventory(fixture.root);
  });
  assert.equal(inventory.upstream.commit, officialCommit);
  assert.equal(inventory.upstream.trackedFiles, expected.trackedFiles);
});
