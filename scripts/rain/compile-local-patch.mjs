#!/usr/bin/env node
/* eslint-disable no-console -- A bounded local package build reports its progress. */
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import {createRequire} from "node:module";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

import {rollup} from "rollup";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const profilePath = path.join(root, "docs/rain/local-patch.json");
const profile = JSON.parse(readFileSync(profilePath, "utf8"));
const delivery = path.resolve(root, process.argv[2] ?? profile.deliveryDirectory);
const finalPackages = path.join(delivery, "packages");
const sha = (content) => createHash("sha256").update(content).digest("hex");
const fileSha = (file) => sha(readFileSync(file));
const git = (args) => execFileSync("git", args, {cwd: root});
const lines = (value) => value.toString().trim().split("\n").filter(Boolean).sort();
const profileSha256 = fileSha(profilePath);
const corePaths = ["packages/react/src", "packages/styles"];
const baseDelivery = path.join(root, profile.baseDeliveryDirectory);
const baseManifestPath = path.join(baseDelivery, "manifest.json");
const baseManifest = JSON.parse(readFileSync(baseManifestPath, "utf8"));
// macOS /var aliases /private/var; TypeScript resolves cwd to the canonical path.
const temporary = realpathSync(mkdtempSync(path.join(tmpdir(), "rain-tabs-patch-")));
const require = createRequire(path.join(root, "package.json"));

assert.ok(
  !existsSync(finalPackages),
  "Refusing to overwrite an existing delivery/packages directory",
);
mkdirSync(delivery, {recursive: true});
const logPath = path.join(delivery, "compile.log");
const log = (message) => {
  console.log(message);
  appendFileSync(logPath, `${message}\n`);
};
const json = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

function guardSources() {
  assert.equal(fileSha(profilePath), profileSha256, "Patch profile changed during compilation");
  assert.deepEqual(
    lines(git(["diff", "--name-only", profile.upstreamCommit, "--", ...corePaths])),
    profile.sources.map(({file}) => file).sort(),
    "Unknown or missing core source differences",
  );
  assert.deepEqual(
    lines(git(["ls-files", "--others", "--exclude-standard", "--", ...corePaths])),
    [],
    "Untracked core sources are not allowed",
  );
  for (const source of profile.sources) {
    assert.equal(
      fileSha(path.join(root, source.file)),
      source.sha256,
      `Unfrozen source: ${source.file}`,
    );
    assert.equal(
      sha(git(["show", `${profile.upstreamCommit}:${source.file}`])),
      source.upstreamSha256,
    );
  }
  for (const input of profile.buildInputs) {
    assert.equal(
      fileSha(path.join(root, input.file)),
      input.sha256,
      `Changed compiler input: ${input.file}`,
    );
    assert.equal(sha(git(["show", `${profile.upstreamCommit}:${input.file}`])), input.sha256);
  }
  for (const name of ["react", "styles"]) {
    const manifestFile = `packages/${name}/package.json`;

    assert.equal(
      fileSha(path.join(root, manifestFile)),
      sha(git(["show", `${profile.upstreamCommit}:${manifestFile}`])),
      `Root package metadata changed: ${name}`,
    );
    assert.equal(
      JSON.parse(readFileSync(path.join(root, manifestFile))).version,
      profile.baseVersion,
    );
  }
  assert.equal(
    fileSha(path.join(root, "packages/rain-theme/index.css")),
    profile.themeSourceSha256,
  );
  assert.equal(fileSha(path.join(root, "pnpm-lock.yaml")), profile.lockfileSha256);
  assert.equal(
    JSON.parse(readFileSync(path.join(root, "packages/rain-theme/package.json"))).version,
    profile.artifactVersions["@rain-classroom/heroui-theme"],
  );
  assert.equal(fileSha(baseManifestPath), profile.baseManifestSha256, "Base manifest changed");
}

function treeHashes(directory) {
  const result = {};
  const walk = (folder) => {
    for (const entry of readdirSync(folder, {withFileTypes: true})) {
      const file = path.join(folder, entry.name);

      if (entry.isDirectory()) walk(file);
      else if (entry.isFile())
        result[path.relative(directory, file).split(path.sep).join("/")] = fileSha(file);
      else assert.fail(`Unexpected non-file in package tree: ${file}`);
    }
  };

  walk(directory);

  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

function changes(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((file) => before[file] !== after[file])
    .sort();
}

function packageVersion(name) {
  let directory = path.dirname(require.resolve(name));

  while (directory !== path.dirname(directory)) {
    const manifest = path.join(directory, "package.json");

    if (existsSync(manifest)) {
      const value = JSON.parse(readFileSync(manifest));

      if (value.name === name) return value.version;
    }
    directory = path.dirname(directory);
  }
  assert.fail(`Cannot identify compiler version: ${name}`);
}

function extract(archive, destination) {
  mkdirSync(destination, {recursive: true});
  execFileSync("tar", ["-xzf", archive, "--strip-components=1", "-C", destination]);
}

function stageSources(source, kind) {
  const directory = path.join(temporary, `${source.packageDirectory}-${kind}`);
  const original = path.join(root, "packages", source.packageDirectory);

  mkdirSync(directory, {recursive: true});
  cpSync(path.join(original, "src"), path.join(directory, "src"), {
    filter: (file) => !file.includes(".stories.") && !file.includes(".test."),
    recursive: true,
  });
  for (const file of ["package.json", "rollup.config.mjs"])
    cpSync(path.join(original, file), path.join(directory, file));
  symlinkSync(path.join(original, "node_modules"), path.join(directory, "node_modules"), "dir");
  const sourceFile = path.relative(`packages/${source.packageDirectory}`, source.file);

  if (kind === "baseline")
    writeFileSync(
      path.join(directory, sourceFile),
      git(["show", `${profile.upstreamCommit}:${source.file}`]),
    );
  if (source.packageDirectory === "styles") {
    json(path.join(directory, "tsconfig.json"), {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        incremental: false,
        noEmit: false,
        outDir: "./candidate",
        rootDir: "./src",
        sourceMap: false,
      },
      exclude: ["node_modules", "candidate", "declarations"],
      extends: path.join(root, "packages/styles/tsconfig.json"),
      files: [sourceFile],
      include: [],
    });
  }

  return {directory, sourceFile};
}

async function compileCandidate(source, kind) {
  const {directory, sourceFile} = stageSources(source, kind);
  const outputDirectory = path.join(directory, "candidate");
  const previousCwd = process.cwd();

  log(`Compiling ${source.packageDirectory} / ${kind}: one Tabs entry and its reachable modules`);
  process.chdir(directory);
  let output;

  try {
    const {default: config} = await import(
      pathToFileURL(path.join(directory, "rollup.config.mjs")).href
    );
    const {output: outputOptions, ...inputOptions} = config;
    const bundle = await rollup({
      ...inputOptions,
      input: {[source.jsModule.replace(/\.js$/, "")]: sourceFile},
      onwarn(warning) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        appendFileSync(logPath, `[${kind}/${source.packageDirectory}] ${warning.message}\n`);
        if (warning.plugin === "typescript") throw new Error(warning.message);
      },
    });

    try {
      ({output} = await bundle.write({
        ...outputOptions,
        dir: outputDirectory,
        preserveModulesRoot: path.join(directory, "src"),
      }));
    } finally {
      await bundle.close();
    }
  } finally {
    process.chdir(previousCwd);
  }

  if (source.packageDirectory === "react") {
    // Same postprocessing boundary as upstream build.mjs: components and hooks only.
    for (const chunk of output.filter((item) => item.type === "chunk")) {
      if (!/^(?:components|hooks)\//.test(chunk.fileName)) continue;
      const stem = path.join(directory, "src", chunk.fileName.replace(/\.js$/, ""));
      const directive = existsSync(`${stem}.tsx`)
        ? "use client"
        : existsSync(`${stem}.ts`)
          ? "use strict"
          : null;
      const file = path.join(outputDirectory, chunk.fileName);
      const code = readFileSync(file, "utf8");

      if (directive && !/^["']use (?:client|strict)["']/.test(code))
        writeFileSync(file, `${JSON.stringify(directive)};\n${code}`);
    }
  }

  const declarationDirectory = path.join(directory, "declarations");
  const declarationConfig = {
    compilerOptions: {
      baseUrl: ".",
      declaration: true,
      declarationMap: source.packageDirectory === "styles",
      emitDeclarationOnly: true,
      incremental: false,
      noEmit: false,
      outDir: declarationDirectory,
      rootDir: "./src",
    },
    exclude: ["node_modules", "candidate", "declarations"],
    extends: path.join(
      root,
      source.packageDirectory === "react"
        ? "packages/standard/tsconfig/react.json"
        : "packages/styles/tsconfig.json",
    ),
    files: [sourceFile],
    include: [],
  };

  json(path.join(directory, "tsconfig.declarations.json"), declarationConfig);
  try {
    const result = execFileSync(
      process.execPath,
      [
        require.resolve("typescript/lib/tsc.js"),
        "--project",
        path.join(directory, "tsconfig.declarations.json"),
      ],
      {cwd: directory, encoding: "utf8", timeout: 60000},
    );

    appendFileSync(
      logPath,
      result || `${source.packageDirectory}/${kind}: focused declaration emit passed\n`,
    );
  } catch (error) {
    appendFileSync(logPath, `${error.stdout ?? ""}\n${error.stderr ?? ""}\n`);
    throw error;
  }

  return {declarationDirectory, directory, output, outputDirectory};
}

function calibrateReactTabsImports(candidate, source, packageStage) {
  const file = path.join(candidate.outputDirectory, source.jsModule);
  const code = readFileSync(file, "utf8");
  const archiveCode = readFileSync(path.join(packageStage, "dist", source.jsModule), "utf8");
  const parse = (text) =>
    ts.createSourceFile(source.jsModule, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const parsed = parse(code);
  const archived = parse(archiveCode);
  const findImport = (tree, specifier) => {
    const imports = tree.statements.filter(
      (node) =>
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === specifier,
    );

    assert.equal(imports.length, 1, `Expected exactly one import: ${specifier}`);

    return imports[0];
  };
  const react = findImport(parsed, "react");
  const originalReact = findImport(archived, "react");

  assert.equal(react.importClause?.name?.text, "React");
  assert.equal(originalReact.importClause?.name?.text, "React__default");
  const edits = [];
  const visit = (node) => {
    if (ts.isIdentifier(node) && node.text === "React") {
      assert.ok(
        (ts.isImportClause(node.parent) && node.parent.name === node) ||
          (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node),
        "Unexpected React binding use during import calibration",
      );
      edits.push({end: node.end, start: node.getStart(parsed), text: "React__default"});
    }
    ts.forEachChild(node, visit);
  };

  visit(parsed);
  const tabs = findImport(parsed, "react-aria-components/Tabs");
  const originalTabs = findImport(archived, "react-aria-components/Tabs");
  const bindings = (node) => {
    assert.ok(ts.isNamedImports(node.importClause?.namedBindings));

    return node.importClause.namedBindings.elements
      .map((element) => `${(element.propertyName ?? element.name).text}:${element.name.text}`)
      .sort();
  };

  assert.deepEqual(bindings(tabs), bindings(originalTabs), "Tabs import bindings changed");
  edits.push({
    end: tabs.end,
    start: tabs.getStart(parsed),
    text: originalTabs.getText(archived),
  });
  let calibrated = code;

  for (const edit of edits.sort((a, b) => b.start - a.start))
    calibrated = calibrated.slice(0, edit.start) + edit.text + calibrated.slice(edit.end);
  writeFileSync(path.join(candidate.directory, "tabs.uncalibrated.js"), code);
  writeFileSync(file, calibrated);
  candidate.output.find((item) => item.type === "chunk" && item.fileName === source.jsModule).code =
    calibrated;
  log("Calibrated React Tabs only: React default binding alias and RAC Tabs named-import order");

  return {
    afterSha256: sha(calibrated),
    beforeSha256: sha(code),
    rules: [
      "React default binding React → React__default",
      "RAC Tabs named imports ordered as the verified base archive",
    ],
  };
}

function exportedNames(file, seen = new Set()) {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const names = new Set();
  const parsed = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  for (const statement of parsed.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
      } else if (
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.startsWith(".")
      ) {
        for (const name of exportedNames(
          path.resolve(path.dirname(file), statement.moduleSpecifier.text),
          seen,
        ))
          names.add(name);
      }
    } else if (ts.isExportAssignment(statement)) names.add("default");
  }

  return names;
}

function checkImports(chunk, packageStage) {
  const parsed = ts.createSourceFile(
    chunk.fileName,
    chunk.code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const specifier = statement.moduleSpecifier.text;

    if (!specifier.startsWith(".")) {
      createRequire(path.join(root, "packages/react/package.json")).resolve(specifier);
      continue;
    }
    const destination = path.resolve(packageStage, "dist", path.dirname(chunk.fileName), specifier);

    assert.ok(destination.startsWith(`${packageStage}${path.sep}`), "Import escapes the package");
    assert.ok(existsSync(destination), `Patch imports missing retained module: ${specifier}`);
    const exports = exportedNames(destination);
    const clause = statement.importClause;
    const bindings =
      clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
        ? clause.namedBindings.elements.map(
            (element) => (element.propertyName ?? element.name).text,
          )
        : [];

    if (clause?.name) bindings.push("default");
    for (const binding of bindings)
      assert.ok(exports.has(binding), `Retained ${specifier} lacks ${binding}`);
  }
}

async function main() {
  guardSources();
  symlinkSync(path.join(root, "node_modules"), path.join(temporary, "node_modules"), "dir");
  const workspaceDist = Object.fromEntries(
    ["react", "styles"].map((name) => [
      name,
      treeHashes(path.join(root, "packages", name, "dist")),
    ]),
  );
  const patch = git([
    "diff",
    "--binary",
    profile.upstreamCommit,
    "--",
    ...profile.sources.map(({file}) => file),
  ]);

  writeFileSync(path.join(delivery, "local-patch.patch"), patch);
  log(`Starting frozen local patch ${profile.id}; staging ${temporary}`);
  const baseArchives = [];
  const compilation = [];
  const replacements = [];
  const packageStages = [];

  for (const source of profile.sources) {
    const base = baseManifest.archives.find(({name}) => name === source.packageName);

    assert.ok(base, `Missing base archive for ${source.packageName}`);
    assert.equal(base.version, profile.baseVersion);
    const archive = path.join(baseDelivery, base.file);

    assert.equal(fileSha(archive), base.sha256, `Untrusted base archive: ${base.file}`);
    baseArchives.push({
      archive: path.relative(root, archive),
      name: base.name,
      sha256: base.sha256,
      version: base.version,
    });
    const packageStage = path.join(temporary, `package-${source.packageDirectory}`);

    extract(archive, packageStage);
    const originalTree = treeHashes(packageStage);
    const baseline = await compileCandidate(source, "baseline");
    const patched = await compileCandidate(source, "patched");
    const importCalibration =
      source.packageDirectory === "react"
        ? {
            baseline: calibrateReactTabsImports(baseline, source, packageStage),
            patched: calibrateReactTabsImports(patched, source, packageStage),
          }
        : null;
    const baselineTree = treeHashes(baseline.outputDirectory);
    const patchedTree = treeHashes(patched.outputDirectory);

    assert.deepEqual(
      changes(baselineTree, patchedTree),
      [source.jsModule],
      "Unexpected changes in reachable compiled modules",
    );
    assert.equal(
      baselineTree[source.jsModule],
      originalTree[`dist/${source.jsModule}`],
      `Single-entry baseline differs from the verified archive: ${source.jsModule}`,
    );
    const baselineChunk = baseline.output.find(
      (item) => item.type === "chunk" && item.fileName === source.jsModule,
    );
    const patchedChunk = patched.output.find(
      (item) => item.type === "chunk" && item.fileName === source.jsModule,
    );

    assert.ok(baselineChunk && patchedChunk);
    assert.deepEqual(
      [...patchedChunk.exports].sort(),
      [...baselineChunk.exports].sort(),
      "Public JS exports changed",
    );
    checkImports(patchedChunk, packageStage);
    const changedFiles = [`dist/${source.jsModule}`];

    cpSync(
      path.join(patched.outputDirectory, source.jsModule),
      path.join(packageStage, "dist", source.jsModule),
    );
    if (source.packageDirectory === "react")
      assert.match(
        readFileSync(path.join(packageStage, "dist", source.jsModule), "utf8"),
        /^"use client";/,
      );
    const declarationFile = source.jsModule.replace(/\.js$/, ".d.ts");
    const baseDeclarations = treeHashes(baseline.declarationDirectory);
    const newDeclarations = treeHashes(patched.declarationDirectory);
    const declarationChanges = changes(baseDeclarations, newDeclarations);

    assert.equal(
      baseDeclarations[declarationFile],
      originalTree[`dist/${declarationFile}`],
      `Baseline declaration differs from archive: ${declarationFile}`,
    );
    if (source.packageDirectory === "react") {
      assert.deepEqual(declarationChanges, [], "React public declarations unexpectedly changed");
    } else {
      assert.deepEqual(
        declarationChanges,
        [declarationFile, `${declarationFile}.map`].sort(),
        "Unexpected Styles declaration changes",
      );
      assert.equal(
        baseDeclarations[`${declarationFile}.map`],
        originalTree[`dist/${declarationFile}.map`],
      );
      for (const file of declarationChanges) {
        cpSync(
          path.join(patched.declarationDirectory, file),
          path.join(packageStage, "dist", file),
        );
        changedFiles.push(`dist/${file}`);
      }
      const sourceInPackage = path.relative(`packages/${source.packageDirectory}`, source.file);

      assert.equal(originalTree[sourceInPackage], source.upstreamSha256);
      cpSync(path.join(root, source.file), path.join(packageStage, sourceInPackage));
      changedFiles.push(sourceInPackage);
      const mapFile = path.join(packageStage, "dist", `${declarationFile}.map`);
      const map = JSON.parse(readFileSync(mapFile));

      for (const sourcePath of map.sources) {
        assert.ok(!path.isAbsolute(sourcePath), "Declaration map leaked an absolute staging path");
        const mappedFile = path.resolve(path.dirname(mapFile), map.sourceRoot ?? "", sourcePath);

        assert.equal(mappedFile, path.join(packageStage, sourceInPackage));
        assert.equal(fileSha(mappedFile), source.sha256);
      }
      assert.ok(
        (
          readFileSync(path.join(packageStage, "dist", declarationFile), "utf8").match(
            /tabLabel: string/g,
          ) ?? []
        ).length >= 3,
        "The new slot is missing from inferred declaration branches",
      );
    }
    const manifestFile = path.join(packageStage, "package.json");
    const manifest = JSON.parse(readFileSync(manifestFile));

    assert.equal(manifest.version, profile.baseVersion);
    manifest.version = profile.artifactVersions[manifest.name];
    manifest.private = true;
    delete manifest.publishConfig;
    if (manifest.name === "@heroui/react")
      manifest.dependencies["@heroui/styles"] = profile.artifactVersions["@heroui/styles"];
    // pnpm pack serializes package.json without a trailing newline.
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    changedFiles.push("package.json");
    const afterTree = treeHashes(packageStage);

    assert.deepEqual(
      changes(originalTree, afterTree),
      changedFiles.sort(),
      "Unrelated package files drifted",
    );
    for (const file of changedFiles)
      replacements.push({
        afterSha256: afterTree[file],
        beforeSha256: originalTree[file],
        file,
        name: source.packageName,
      });
    compilation.push({
      baselineArchiveModuleSha256: originalTree[`dist/${source.jsModule}`],
      baselineMatchesArchive:
        baselineTree[source.jsModule] === originalTree[`dist/${source.jsModule}`],
      baselineModuleSha256: baselineTree[source.jsModule],
      declarationChanges,
      entry: source.file,
      importCalibration,
      jsChanges: [source.jsModule],
      name: source.packageName,
      outputModules: Object.keys(baselineTree),
      sharedModulesPreserved: true,
      toolchain:
        source.packageDirectory === "react"
          ? "Upstream Rollup/Babel, narrowed entry; upstream directive postprocess"
          : "Upstream Rollup/TypeScript, narrowed entry and TS program",
    });
    packageStages.push({directory: packageStage, manifest});
    log(`${source.packageName}: baseline calibrated; only expected package files replaced`);
  }

  const themeStage = path.join(temporary, "package-theme");

  cpSync(path.join(root, "packages/rain-theme"), themeStage, {
    filter: (file) => path.basename(file) !== "node_modules",
    recursive: true,
  });
  const themeManifest = JSON.parse(readFileSync(path.join(themeStage, "package.json")));

  assert.equal(themeManifest.private, true);
  assert.equal(fileSha(path.join(themeStage, "index.css")), profile.themeSourceSha256);
  writeFileSync(path.join(themeStage, "package.json"), JSON.stringify(themeManifest, null, 2));
  packageStages.push({directory: themeStage, manifest: themeManifest});
  const archiveStage = path.join(temporary, "archives");

  mkdirSync(archiveStage);
  const artifacts = [];

  for (const {directory, manifest} of packageStages) {
    const packLog = execFileSync("pnpm", ["pack", "--pack-destination", archiveStage], {
      cwd: directory,
      encoding: "utf8",
      timeout: 60000,
    });

    appendFileSync(logPath, packLog);
    const archive = `${manifest.name.replace(/^@/, "").replace("/", "-")}-${manifest.version}.tgz`;
    const packed = JSON.parse(
      execFileSync("tar", ["-xOf", path.join(archiveStage, archive), "package/package.json"], {
        encoding: "utf8",
      }),
    );

    assert.equal(packed.name, manifest.name);
    assert.equal(packed.version, profile.artifactVersions[manifest.name]);
    assert.equal(packed.private, true);
    assert.equal(packed.publishConfig, undefined);
    if (packed.name === "@heroui/react")
      assert.equal(
        packed.dependencies["@heroui/styles"],
        profile.artifactVersions["@heroui/styles"],
      );
    const unpacked = path.join(temporary, `verified-${manifest.name.replaceAll("/", "-")}`);

    extract(path.join(archiveStage, archive), unpacked);
    assert.deepEqual(
      treeHashes(unpacked),
      treeHashes(directory),
      `Packed files differ from verified staging: ${manifest.name}`,
    );
    artifacts.push({
      archive,
      name: packed.name,
      sha256: fileSha(path.join(archiveStage, archive)),
      version: packed.version,
    });
  }

  guardSources();
  for (const name of ["react", "styles"])
    assert.deepEqual(
      treeHashes(path.join(root, "packages", name, "dist")),
      workspaceDist[name],
      `Workspace dist changed: ${name}`,
    );
  const provenance = {
    artifacts,
    baseArchives,
    baseVersion: profile.baseVersion,
    compilation,
    compiledAt: new Date().toISOString(),
    limitations: [
      "Only Tabs entries and their reachable modules/declarations were compiled; no full build or test sweep.",
      "Existing local compiler/dependencies reused; no network installation or publication.",
    ],
    lockfileSha256: profile.lockfileSha256,
    patchId: profile.id,
    patchSha256: sha(patch),
    profileSha256,
    replacements,
    sources: profile.sources.map(({file, sha256, upstreamSha256}) => ({
      file,
      sha256,
      upstreamSha256,
    })),
    staging: temporary,
    themeSourceSha256: profile.themeSourceSha256,
    toolVersions: Object.fromEntries(
      [
        "rollup",
        "@rollup/plugin-babel",
        "@rollup/plugin-typescript",
        "@babel/core",
        "@babel/preset-react",
        "@babel/preset-typescript",
        "typescript",
      ].map((name) => [name, packageVersion(name)]),
    ),
    upstreamCommit: profile.upstreamCommit,
    workspaceDistPreserved: true,
  };
  const pending = mkdtempSync(path.join(delivery, ".packages-staging-"));

  for (const artifact of artifacts)
    cpSync(path.join(archiveStage, artifact.archive), path.join(pending, artifact.archive));
  assert.ok(!existsSync(finalPackages), "Delivery packages appeared during compilation");
  renameSync(pending, finalPackages);
  json(path.join(delivery, "patch-provenance.json"), provenance);
  log(`Local patch archives ready: ${delivery}`);
}

main().catch((error) => {
  appendFileSync(logPath, `${error.stack ?? error}\n`);
  console.error(error);
  process.exitCode = 1;
});
