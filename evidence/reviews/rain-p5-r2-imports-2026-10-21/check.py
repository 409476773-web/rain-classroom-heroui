"""Read-only archive identity and declared JavaScript entry imports in the existing r2 consumer."""
import glob
import hashlib
import json
import pathlib
import subprocess
import tarfile

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(__file__).resolve().parent
DELIVERY = ROOT / "delivery/rain-heroui-local-2026-10-20-r2"
report = json.loads((DELIVERY / "report.json").read_text())
manifest = json.loads((DELIVERY / "manifest.json").read_text())
consumer = pathlib.Path(report["temporaryConsumer"])
assert consumer.is_dir(), "Existing consumer is unavailable; no replacement environment is created"
assert not (OUT / "results.json").exists(), "Do not replace existing evidence"
sha = lambda content: hashlib.sha256(content).hexdigest()
before = {str(p.relative_to(ROOT)): sha(p.read_bytes()) for p in DELIVERY.rglob("*") if p.is_file()}
identities, requests, skipped = [], [], []

for artifact in manifest["archives"]:
    archive = DELIVERY / artifact["file"]
    assert sha(archive.read_bytes()) == artifact["sha256"]
    recorded = next(item for item in report["artifacts"] if item["name"] == artifact["name"])
    assert recorded["sha256"] == artifact["sha256"]
    package = consumer / "node_modules" / artifact["name"]
    assert package.is_dir() and not package.is_symlink()
    assert package.resolve().is_relative_to(consumer.resolve())
    files = []
    with tarfile.open(archive) as tgz:
        for member in tgz.getmembers():
            relative = pathlib.PurePosixPath(member.name).relative_to("package")
            assert ".." not in relative.parts
            target = package / str(relative)
            if member.isfile():
                assert target.is_file() and not target.is_symlink()
                expected = tgz.extractfile(member).read()
                assert target.read_bytes() == expected, str(target)
                files.append({"path": str(relative), "sha256": sha(expected)})
            elif member.issym():
                assert target.is_symlink() and target.readlink().as_posix() == member.linkname
            else:
                assert member.isdir(), f"Unexpected archive entry: {member.name}"
    package_json = json.loads((package / "package.json").read_text())
    assert package_json["name"] == artifact["name"]
    assert package_json["version"] == artifact["version"] == recorded["version"]
    actual_files = sorted(str(p.relative_to(package)) for p in package.rglob("*") if p.is_file())
    assert actual_files == sorted(item["path"] for item in files), "Unexpected extracted package files"
    identities.append({**artifact, "resolvedPackage": str(package.resolve()), "verifiedFiles": len(files), "files": files})
    for subpath, conditions in package_json["exports"].items():
        conditions = {"default": conditions} if isinstance(conditions, str) else conditions
        selected = conditions.get("import", conditions.get("default"))
        assert isinstance(selected, str), "This archive probe expects flat export conditions"
        if not selected.endswith((".js", ".mjs", ".cjs")):
            skipped.append({"package": artifact["name"], "subpath": subpath, "target": selected, "reason": "non-JavaScript export; not imported"})
            continue
        targets = sorted(glob.glob(str(package / selected))) if "*" in selected else [str(package / selected)]
        assert targets, f"Empty JavaScript wildcard: {subpath}"
        for target in targets:
            relative = pathlib.Path(target).relative_to(package).as_posix()
            exposed = subpath
            if "*" in selected:
                prefix, suffix = selected.removeprefix("./").split("*")
                capture = relative[len(prefix):len(relative) - len(suffix)]
                exposed = subpath.replace("*", capture)
            specifier = artifact["name"] + (exposed[1:] if exposed != "." else "")
            requests.append({"specifier": specifier, "target": str(pathlib.Path(target).resolve()), "package": artifact["name"], "mode": "ESM", "declaredRequire": "require" in conditions})
            assert "require" not in conditions, "A declared CJS branch requires a separate require probe"

(OUT / "identity.json").write_text(json.dumps(identities, indent=2) + "\n")
(OUT / "requests.json").write_text(json.dumps(requests, indent=2) + "\n")
probe = r'''
import assert from "node:assert/strict";
import {readFileSync, realpathSync} from "node:fs";
import {fileURLToPath} from "node:url";
const results = [];
for (const request of JSON.parse(readFileSync(process.argv[1], "utf8"))) {
  try {
    const resolved = realpathSync(fileURLToPath(import.meta.resolve(request.specifier)));
    assert.equal(resolved, request.target);
    const namespace = await import(request.specifier);
    const names = Object.keys(namespace);
    assert.ok(names.length, `Empty export namespace: ${request.specifier}`);
    results.push({...request, resolved, exportedNames: names, status: "imported"});
  } catch (error) {
    results.push({...request, status: "failed", error: String(error.stack ?? error)});
  }
}
process.stdout.write(JSON.stringify({node: process.version, cwd: process.cwd(), entries: results}, null, 2) + "\n");
assert.ok(results.every(result => result.status === "imported"), "Some declared JS entry imports failed");
'''
execution = subprocess.run(["node", "--input-type=module", "--eval", probe, str(OUT / "requests.json")], cwd=consumer, text=True, capture_output=True)
(OUT / "import-results.json").write_text(execution.stdout)
(OUT / "import-stderr.log").write_text(execution.stderr)
after = {str(p.relative_to(ROOT)): sha(p.read_bytes()) for p in DELIVERY.rglob("*") if p.is_file()}
assert before == after, "Frozen delivery content changed"
imports = json.loads(execution.stdout)
summary = {
    "status": "passed" if execution.returncode == 0 else "failed",
    "temporaryConsumer": str(consumer),
    "node": imports["node"],
    "archiveIdentity": {item["name"]: {"sha256": item["sha256"], "verifiedFiles": item["verifiedFiles"]} for item in identities},
    "esm": {name: sum(entry["package"] == name for entry in imports["entries"]) for name in [item["name"] for item in identities]},
    "successfulImports": sum(entry["status"] == "imported" for entry in imports["entries"]),
    "failedImports": sum(entry["status"] == "failed" for entry in imports["entries"]),
    "cjs": {"declaredRequireEntries": 0, "checked": 0, "reason": "These three packages declare no require condition; ESM default branches are not presented as a separate CJS pass"},
    "nonJavaScriptExcluded": skipped,
    "frozenDeliveryFilesUnchanged": len(before),
    "limitations": ["Third-party dependencies reuse existing local installations; this is not a clean install", "Imports check resolution and module evaluation, not rendering, component behavior, browser compatibility, RSC, or production readiness", "CSS, type declarations, metadata and wildcard CSS export patterns are excluded from JavaScript import counts", "Imports run serially in one Node process and may reuse its normal module cache"],
}
(OUT / "results.json").write_text(json.dumps(summary, indent=2) + "\n")
assert execution.returncode == 0, execution.stderr
assert summary["successfulImports"] == len(requests) and summary["failedImports"] == 0
print(json.dumps({key: summary[key] for key in ["status", "esm", "successfulImports", "failedImports", "frozenDeliveryFilesUnchanged"]}, indent=2))
