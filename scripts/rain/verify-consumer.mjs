#!/usr/bin/env node
/* eslint-disable no-console -- This local artifact probe reports its evidence directory. */
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import {createRequire} from "node:module";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const evidence = path.resolve(root, process.argv[2] ?? "evidence/runtime/rain-consumer-check");
const exampleSource = process.argv[3] ? path.resolve(root, process.argv[3]) : null;
const patchProfilePath = path.join(root, "docs/rain/local-patch.json");
const patchProfile = existsSync(patchProfilePath)
  ? JSON.parse(readFileSync(patchProfilePath, "utf8"))
  : null;
const preparedDirectory = process.argv[4] ?? patchProfile?.deliveryDirectory;
const prepared = preparedDirectory ? path.resolve(root, preparedDirectory) : null;
const provenance = prepared
  ? JSON.parse(readFileSync(path.join(prepared, "patch-provenance.json"), "utf8"))
  : null;
const temporary = mkdtempSync(path.join(tmpdir(), "rain-heroui-consumer-"));
const consumer = path.join(temporary, "consumer");
const archives = path.join(evidence, "packages");
const names = ["styles", "react", "rain-theme"];
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const cleanPackage = `${quote(process.execPath)} ${quote(path.join(realpathSync(path.join(root, "node_modules/clean-package")), "bin/main.js"))}`;
const preparedArtifacts = new Map(
  (provenance?.artifacts ?? []).map((artifact) => [artifact.name, artifact]),
);
const manifests = names.map((name) => {
  const workspaceManifest = JSON.parse(
    readFileSync(path.join(root, "packages", name, "package.json"), "utf8"),
  );

  if (!prepared) return workspaceManifest;
  const artifact = preparedArtifacts.get(workspaceManifest.name);

  assert.ok(artifact, `Prepared archive absent: ${workspaceManifest.name}`);
  assert.equal(path.basename(artifact.archive), artifact.archive);

  return JSON.parse(
    execFileSync("tar", [
      "-xOf",
      path.join(prepared, "packages", artifact.archive),
      "package/package.json",
    ]),
  );
});
const versions = new Map(
  readdirSync(path.join(root, "packages")).flatMap((name) => {
    const manifest = path.join(root, "packages", name, "package.json");

    if (!existsSync(manifest)) return [];
    const {name: packageName, version} = JSON.parse(readFileSync(manifest, "utf8"));

    return [[packageName, version]];
  }),
);

mkdirSync(archives, {recursive: true});
mkdirSync(path.join(consumer, "node_modules"), {recursive: true});
const thirdParty = new Set(["@types/react", "@types/react-dom"]);
const artifacts = [];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const themeSourcePath = path.join(root, "packages/rain-theme/index.css");
const themeSourceSha256 = sha256(readFileSync(themeSourcePath));
const lockfileSha256 = sha256(readFileSync(path.join(root, "pnpm-lock.yaml")));

if (provenance) {
  assert.equal(provenance.themeSourceSha256, themeSourceSha256);
  assert.equal(provenance.lockfileSha256, lockfileSha256);
  for (const source of provenance.sources) {
    assert.equal(sha256(readFileSync(path.join(root, source.file))), source.sha256);
  }
} else {
  const upstream = JSON.parse(readFileSync(path.join(root, "docs/rain/upstream.json"), "utf8"));

  execFileSync(
    "git",
    ["diff", "--exit-code", upstream.commit, "--", "packages/react/src", "packages/styles"],
    {cwd: root},
  );
}

if (exampleSource) cpSync(exampleSource, path.join(consumer, "example"), {recursive: true});

for (const [index, name] of names.entries()) {
  const original = path.join(root, "packages", name);
  const stage = path.join(temporary, name);

  if (!prepared && name !== "rain-theme")
    assert.ok(existsSync(path.join(original, "dist/index.js")), `Missing existing build: ${name}`);
  if (!prepared)
    cpSync(original, stage, {
      filter: (file) =>
        !["node_modules", ".turbo", "tsconfig.tsbuildinfo"].includes(path.basename(file)),
      recursive: true,
    });
  const manifest = structuredClone(manifests[index]);

  for (const hook of ["prepack", "postpack"]) {
    if (manifest.scripts?.[hook])
      manifest.scripts[hook] = manifest.scripts[hook].replaceAll("clean-package", cleanPackage);
  }

  for (const field of ["dependencies", "peerDependencies", "devDependencies"]) {
    for (const [dependency, version] of Object.entries(manifest[field] ?? {})) {
      if (version.startsWith("workspace:")) {
        assert.ok(versions.has(dependency), `Unknown workspace dependency: ${dependency}`);
        manifest[field][dependency] = versions.get(dependency);
      }
      if (field !== "devDependencies" && !names.some((_, i) => manifests[i].name === dependency))
        thirdParty.add(dependency);
    }
  }
  if (!prepared)
    writeFileSync(path.join(stage, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const packageModules = path.join(original, "node_modules");

  if (!prepared && existsSync(packageModules))
    symlinkSync(packageModules, path.join(stage, "node_modules"), "dir");
  if (!prepared && name === "react" && !existsSync(path.join(stage, "dist/index.d.ts"))) {
    // Same declaration-only options as upstream generate-types.mjs, in the isolated copy.
    const config = {
      compilerOptions: {
        baseUrl: ".",
        declaration: true,
        declarationMap: false,
        emitDeclarationOnly: true,
        noEmit: false,
        outDir: "./dist",
        rootDir: "./src",
      },
      exclude: ["node_modules", "**/*.stories.*", "**/*.test.*", "dist", ".rollup.cache"],
      extends: path.join(root, "packages/standard/tsconfig/react.json"),
      include: ["src"],
    };

    writeFileSync(path.join(stage, "tsconfig.build.json"), JSON.stringify(config, null, 2));
    const log = execFileSync(
      process.execPath,
      [
        path.join(root, "node_modules/typescript/lib/tsc.js"),
        "--project",
        path.join(stage, "tsconfig.build.json"),
      ],
      {encoding: "utf8", timeout: 60000},
    );

    writeFileSync(
      path.join(evidence, "declaration-generation.log"),
      log || "Upstream declaration-only emit completed in isolated staging.\n",
    );
  }
  if (!prepared) {
    const output = execFileSync("pnpm", ["pack", "--pack-destination", archives], {
      cwd: stage,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${path.join(root, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`,
      },
      timeout: 60000,
    });

    writeFileSync(path.join(evidence, `${name}-pack.log`), output);
  } else {
    const artifact = preparedArtifacts.get(manifest.name);
    const inputArchive = path.join(prepared, "packages", artifact.archive);

    assert.equal(sha256(readFileSync(inputArchive)), artifact.sha256);
    const targetArchive = path.join(archives, artifact.archive);

    if (inputArchive !== targetArchive) cpSync(inputArchive, targetArchive);
  }
  const archive = readdirSync(archives).find(
    (file) =>
      file === `${manifest.name.replace(/^@/, "").replace("/", "-")}-${manifest.version}.tgz`,
  );

  assert.ok(archive, `No archive for ${manifest.name}`);
  const destination = path.join(consumer, "node_modules", manifest.name);

  mkdirSync(destination, {recursive: true});
  execFileSync("tar", [
    "-xzf",
    path.join(archives, archive),
    "--strip-components=1",
    "-C",
    destination,
  ]);
  const packed = JSON.parse(readFileSync(path.join(destination, "package.json"), "utf8"));
  let checkedExports = 0;

  function checkExport(value) {
    if (typeof value === "string" && value.startsWith("./") && !value.includes("*")) {
      assert.ok(
        existsSync(path.join(destination, value)),
        `${manifest.name}: absent export ${value}`,
      );
      assert.ok(!value.startsWith("./src/"), `${manifest.name}: runtime export still uses source`);
      checkedExports++;
    } else if (value && typeof value === "object") Object.values(value).forEach(checkExport);
  }
  checkExport(packed.exports);
  if (name === "rain-theme")
    assert.equal(sha256(readFileSync(path.join(destination, "index.css"))), themeSourceSha256);
  artifacts.push({
    archive,
    checkedExports,
    name: manifest.name,
    sha256: sha256(readFileSync(path.join(archives, archive))),
    version: manifest.version,
  });
}

// Reuse installed third-party versions, while all three tested packages come from extracted archives.
for (const dependency of thirdParty) {
  const source = ["packages/react", "packages/styles", "apps/docs"]
    .map((directory) => path.join(root, directory, "node_modules", dependency))
    .find(existsSync);

  assert.ok(source, `Missing already-installed dependency: ${dependency}`);
  const target = path.join(consumer, "node_modules", dependency);

  mkdirSync(path.dirname(target), {recursive: true});
  symlinkSync(realpathSync(source), target, "dir");
}
writeFileSync(path.join(consumer, "package.json"), '{"type":"module","private":true}\n');
const probe = `import assert from 'node:assert/strict';
import * as React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Button,Card,Form,TextField,Label,Input,Tabs} from '@heroui/react';
import {Button as DirectButton} from '@heroui/react/button';
import {Tabs as DirectTabs} from '@heroui/react/tabs';
import {tabsVariants} from '@heroui/styles';
assert.equal(Button,DirectButton);
assert.equal(Tabs,DirectTabs);
const html=renderToStaticMarkup(React.createElement(Card,null,React.createElement(Card.Header,null,React.createElement(Card.Title,null,'课程反馈')),React.createElement(Card.Content,null,React.createElement(Form,null,React.createElement(TextField,{name:'comment',isRequired:true},React.createElement(Label,null,'反馈'),React.createElement(Input,{placeholder:'填写反馈'})),React.createElement(Button,{type:'submit'},'提交')))));
assert.ok(html.includes('反馈') && html.includes('<input') && html.includes('type="submit"'));
${
  provenance
    ? `assert.equal(typeof tabsVariants().tabLabel,'function');
const tabsHtml=renderToStaticMarkup(React.createElement(Tabs,null,React.createElement(Tabs.List,{'aria-label':'交付标签'},React.createElement(Tabs.Tab,{id:'review'},'完整课堂练习批改记录',2026,React.createElement(Tabs.Indicator))),React.createElement(Tabs.Panel,{id:'review'},'固定示例')));
assert.match(tabsHtml, /data-slot="tabs-label"[^>]*>完整课堂练习批改记录2026<\\/span>/);`
    : ""
}
const react=import.meta.resolve('@heroui/react');
const styles=import.meta.resolve('@heroui/styles');
assert.ok(react.includes('/consumer/node_modules/@heroui/react/dist/'));
assert.ok(styles.includes('/consumer/node_modules/@heroui/styles/dist/'));
console.log(JSON.stringify({react,styles,rootAndSubpathImport:true,ssr:true,tabsPatch:${Boolean(provenance)},html}));\n`;

writeFileSync(path.join(consumer, "probe.mjs"), probe);
const runtime = JSON.parse(
  execFileSync(process.execPath, ["probe.mjs"], {cwd: consumer, encoding: "utf8", timeout: 30000}),
);

writeFileSync(path.join(evidence, "consumer.html"), runtime.html);
writeFileSync(
  path.join(consumer, "probe.tsx"),
  `import * as React from 'react';\nimport {Button,Card,Form,TextField,Label,Input} from '@heroui/react';\nimport {Button as DirectButton} from '@heroui/react/button';\n${provenance ? "import {tabsVariants} from '@heroui/styles';\nexport const tabLabelStyle: string = tabsVariants().tabLabel();\n" : ""}export const Example=()=> <Card><Card.Content><Form><TextField name="feedback" isRequired><Label>反馈</Label><Input /></TextField><Button type="submit">提交</Button><DirectButton>返回</DirectButton></Form></Card.Content></Card>;\n// @ts-expect-error The packed declarations must reject unknown props.\nexport const InvalidButton = <Button doesNotExistRain />;\n// @ts-expect-error Required remains a boolean in the packed public API.\nexport const InvalidField = <TextField isRequired="yes" />;\n`,
);
// Match upstream packages/standard/tsconfig/react.json and browser bundler consumers.
writeFileSync(
  path.join(consumer, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: "ES2022",
      },
      files: [
        "probe.tsx",
        ...(exampleSource ? ["example/App.tsx", "example/App.styles.ts", "example/main.tsx"] : []),
      ],
    },
    null,
    2,
  ),
);
execFileSync(
  process.execPath,
  [
    path.join(root, "node_modules/typescript/lib/tsc.js"),
    "--project",
    path.join(consumer, "tsconfig.json"),
  ],
  {encoding: "utf8", timeout: 60000},
);

const require = createRequire(path.join(root, "apps/docs/package.json"));
const tailwind = require("@tailwindcss/postcss");
const postcss = require("postcss");

const input = exampleSource
  ? readFileSync(path.join(consumer, "example/global.css"), "utf8")
  : '@import "@heroui/styles";\n@import "@rain-classroom/heroui-theme";\n@source "./probe.tsx";\n';

writeFileSync(path.join(consumer, "probe.css"), input);
const css = await postcss([tailwind()]).process(input, {
  from: path.join(consumer, exampleSource ? "example/global.css" : "probe.css"),
});

assert.match(css.css, /--rain-button-radius:\s*10px/);
assert.match(css.css, /data-rain-theme/);
assert.match(css.css, /\.button\s*\{/);
if (provenance) {
  assert.match(css.css, /--rain-table-background:\s*#ebefff/i);
  assert.match(css.css, /\.tabs__label/);
  assert.match(css.css, /text-overflow:\s*ellipsis/);
  for (const source of provenance.sources) {
    assert.equal(sha256(readFileSync(path.join(root, source.file))), source.sha256);
  }
}
writeFileSync(path.join(evidence, "consumer.css"), css.css);
assert.equal(
  sha256(readFileSync(themeSourcePath)),
  themeSourceSha256,
  "Theme changed during packing",
);
assert.equal(
  sha256(readFileSync(path.join(root, "pnpm-lock.yaml"))),
  lockfileSha256,
  "Lockfile changed during verification",
);
const report = {
  artifacts,
  consumerTypecheck: true,
  exampleTypecheck: Boolean(exampleSource),
  limitations: [
    "Third-party dependencies reuse existing local installs; this is not a clean network installation.",
    "A historical NodeNext probe rejected upstream extensionless declaration barrels; NodeNext was not rerun. This result covers Bundler consumers.",
  ],
  lockfileSha256,
  packagedCssCompiled: true,
  patchProvenance: provenance
    ? path.relative(root, path.join(prepared, "patch-provenance.json"))
    : null,
  runtime: {...runtime, html: "consumer.html"},
  temporaryConsumer: consumer,
  themeSourceSha256,
  typeResolution: "Bundler, matching upstream React config; includes negative type checks",
  verification: provenance
    ? "verified base archives + isolated Tabs module and declaration patch + current Rain theme; no full rebuild, registry install, browser sweep or publication"
    : "existing JS build + isolated declaration-only emit + current Rain theme; no full rebuild, registry install, browser sweep or publication",
};

writeFileSync(path.join(evidence, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`本地包消费检查通过；证据：${evidence}`);
