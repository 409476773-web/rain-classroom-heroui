#!/usr/bin/env python3
"""Run the original browser configuration after the matching engine is installed."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import shlex
import subprocess
import time

OUT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
installation = OUT / "chromium-ranged-install.command.json"
deadline = time.monotonic() + 1200
print("Waiting for matching Chromium installation to complete", flush=True)
while not installation.exists():
    if time.monotonic() > deadline:
        raise RuntimeError("Matching browser installation did not complete within 20 minutes")
    time.sleep(5)
install = json.loads(installation.read_text())
assert install["exitCode"] == 0, "Matching Chromium installation failed; see recorded installation log"
version = subprocess.check_output([str(Path(install["destination"]) / "chrome-headless-shell-mac-arm64/chrome-headless-shell"), "--version"], text=True).strip()
assert "153.0.8010.12" in version
name = "browser-matching-1243"
cmd = ["pnpm", "--filter", "@heroui/react", "exec", "vitest", "run", "--project", "react-browser", "--maxWorkers=1", "--browser.fileParallelism=false", "--reporter=default", "--reporter=json", "--outputFile=" + str(OUT / (name + ".json"))]
record = {"name": name, "classification": "upstream-matching-browser", "actualBrowserVersion": version, "playwrightRevision": "1243", "command": cmd, "shellDisplay": shlex.join(cmd), "cwd": str(ROOT), "startedAt": datetime.now(timezone.utc).isoformat(), "log": str(OUT / (name + ".log"))}
start = time.monotonic()
print("Starting original Chromium 153 browser suites", flush=True)
with (OUT / (name + ".log")).open("w") as log:
    log.write("Command: " + record["shellDisplay"] + "\nBrowser: " + version + "\n\n"); log.flush()
    process = subprocess.run(cmd, cwd=ROOT, env=dict(os.environ, CI="1", NO_COLOR="1"), stdout=log, stderr=subprocess.STDOUT)
record.update({"exitCode": process.returncode, "finishedAt": datetime.now(timezone.utc).isoformat(), "durationSeconds": round(time.monotonic() - start, 2)})
report = OUT / (name + ".json")
if report.exists():
    data = json.loads(report.read_text())
    record["vitestSummary"] = {key: data.get(key) for key in ["numTotalTests", "numPassedTests", "numFailedTests", "numPendingTests", "success"]}
    record["resultFiles"] = len(data.get("testResults", []))
(OUT / (name + ".command.json")).write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
before = json.loads((OUT / "source-fingerprints-before.json").read_text())
changed = [path for path, digest in before.items() if not (ROOT / path).exists() or hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != digest]
summary = json.loads((OUT / "run-summary.json").read_text())
summary["records"].extend([json.loads((OUT / "browser-cached-1234.command.json").read_text()), install, record])
summary["sourceAndLockfileChanges"] = changed
summary["completedAt"] = datetime.now(timezone.utc).isoformat()
summary["browserInstallResolution"] = "Exact upstream Chromium 153 / revision 1243 installed from official Google Storage using curl ranges; full official MD5 matched. Original browser configuration used for final run."
(OUT / "run-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"record": record, "sourceAndLockfileChanges": changed}, ensure_ascii=False), flush=True)
