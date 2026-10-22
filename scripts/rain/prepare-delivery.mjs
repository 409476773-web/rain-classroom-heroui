#!/usr/bin/env node
/* eslint-disable no-console -- Reports the location of the local delivery files. */
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {copyFileSync, existsSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const delivery = path.resolve(root, process.argv[2] ?? "delivery/rain-heroui-local-2026-10-20-r2");
const sha256 = (content) => createHash("sha256").update(content).digest("hex");
const beforeTheme = sha256(readFileSync(path.join(root, "packages/rain-theme/index.css")));
const beforeLock = sha256(readFileSync(path.join(root, "pnpm-lock.yaml")));

assert.ok(
  !existsSync(path.join(delivery, "packages")),
  "Choose a new delivery directory instead of overwriting existing archives.",
);
assert.ok(
  existsSync(path.join(delivery, "example/App.tsx")),
  "The copyable example must be prepared first.",
);
for (const name of ["react", "styles"]) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "packages", name, "package.json"), "utf8"),
  );

  assert.equal(manifest.version, "3.2.6", `Unexpected HeroUI version: ${name}`);
}
const theme = JSON.parse(readFileSync(path.join(root, "packages/rain-theme/package.json"), "utf8"));

assert.equal(theme.version, "0.1.2");
assert.equal(theme.private, true);
const upstream = JSON.parse(readFileSync(path.join(root, "docs/rain/upstream.json"), "utf8"));

// The isolated compiler enforces the exact approved Tabs paths and source hashes.
// Reusing the former zero-diff guard would reject the user-requested local patch.
const preparation = execFileSync(
  process.execPath,
  [path.join(root, "scripts/rain/compile-local-patch.mjs"), delivery],
  {cwd: root, encoding: "utf8", timeout: 180000},
);

writeFileSync(path.join(delivery, "preparation-command.log"), preparation);
const output = execFileSync(
  process.execPath,
  [
    path.join(root, "scripts/rain/verify-consumer.mjs"),
    delivery,
    path.join(delivery, "example"),
    delivery,
  ],
  {cwd: root, encoding: "utf8", timeout: 180000},
);

writeFileSync(path.join(delivery, "verification-command.log"), output);
const report = JSON.parse(readFileSync(path.join(delivery, "report.json"), "utf8"));
const provenance = JSON.parse(readFileSync(path.join(delivery, "patch-provenance.json"), "utf8"));

assert.equal(report.themeSourceSha256, beforeTheme);
assert.equal(report.lockfileSha256, beforeLock);
assert.equal(provenance.upstreamCommit, upstream.commit);
for (const source of provenance.sources) {
  assert.equal(sha256(readFileSync(path.join(root, source.file))), source.sha256);
}
assert.equal(sha256(readFileSync(path.join(root, "packages/rain-theme/index.css"))), beforeTheme);
assert.equal(sha256(readFileSync(path.join(root, "pnpm-lock.yaml"))), beforeLock);
const archives = report.artifacts.map(({archive, name, sha256, version}) => ({
  file: `packages/${archive}`,
  name,
  sha256,
  version,
}));
const manifest = {
  archives,
  createdAt: new Date().toISOString(),
  dependencyVerification:
    "Existing local third-party dependencies reused; no clean network installation.",
  heroUiCommit: upstream.commit,
  heroUiRelease: upstream.release,
  localPatch: {
    artifactVersions: Object.fromEntries(archives.map(({name, version}) => [name, version])),
    provenance: "patch-provenance.json",
    provenanceSha256: sha256(readFileSync(path.join(delivery, "patch-provenance.json"))),
    sources: provenance.sources,
  },
  lockfileSha256: beforeLock,
  privateLocalDelivery: true,
  themeSourceSha256: beforeTheme,
  verification: "report.json",
};

writeFileSync(path.join(delivery, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  path.join(delivery, "SHA256SUMS"),
  `${archives.map(({file, sha256}) => `${sha256}  ${file}`).join("\n")}\n`,
);
copyFileSync(path.join(root, "LICENSE"), path.join(delivery, "UPSTREAM-LICENSE"));
console.log(`Local delivery prepared: ${delivery}`);
