#!/usr/bin/env python3
"""Run the unchanged upstream React suites and preserve local evidence."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import shlex
import subprocess
import time

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent


def now():
    return datetime.now(timezone.utc).isoformat()


def source_fingerprint():
    directories = [ROOT / "packages/react/src", ROOT / "packages/styles/src", ROOT / "packages/react/tests"]
    entries = {}
    for directory in directories:
        for path in sorted(directory.rglob("*")):
            if path.is_file() and "__screenshots__" not in path.parts:
                entries[str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
    for rel in ["pnpm-lock.yaml", "packages/react/vitest.config.ts", "packages/testing/configs/base.mjs", "packages/testing/configs/react.mjs", "packages/testing/configs/browser.mjs"]:
        entries[rel] = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()
    return entries


def run(name, command):
    record = {"name": name, "command": command, "shellDisplay": shlex.join(command), "cwd": str(ROOT), "startedAt": now(), "log": str(OUT / (name + ".log"))}
    started = time.monotonic()
    print("Starting " + name, flush=True)
    with (OUT / (name + ".log")).open("w") as log:
        log.write("Command: " + record["shellDisplay"] + "\nStarted: " + record["startedAt"] + "\n\n")
        log.flush()
        env = dict(os.environ, CI="1", NO_COLOR="1")
        process = subprocess.run(command, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, env=env)
    record.update({"exitCode": process.returncode, "finishedAt": now(), "durationSeconds": round(time.monotonic() - started, 2)})
    report = OUT / (name + ".json")
    if report.exists():
        data = json.loads(report.read_text())
        record["vitestSummary"] = {key: data.get(key) for key in ["numTotalTestSuites", "numPassedTestSuites", "numFailedTestSuites", "numPendingTestSuites", "numTotalTests", "numPassedTests", "numFailedTests", "numPendingTests", "success"]}
        record["resultFiles"] = len(data.get("testResults", []))
    (OUT / (name + ".command.json")).write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    print("Finished " + name + ": exit " + str(process.returncode), flush=True)
    return record


assert (ROOT / "packages/styles/dist/index.js").exists(), "styles/dist/index.js must be built first"
before = source_fingerprint()
(OUT / "source-fingerprints-before.json").write_text(json.dumps(before, indent=2) + "\n")
base = ["pnpm", "--filter", "@heroui/react", "exec", "vitest", "run"]
jsdom = base + ["--project", "react-jsdom", "--maxWorkers=1", "--reporter=default", "--reporter=json", "--outputFile=" + str(OUT / "jsdom-ssr.json")]
install = ["pnpm", "--filter", "@heroui/testing", "exec", "playwright", "install", "chromium"]
with ThreadPoolExecutor(max_workers=2) as pool:
    jsdom_job = pool.submit(run, "jsdom-ssr", jsdom)
    install_job = pool.submit(run, "chromium-install", install)
    records = [jsdom_job.result(), install_job.result()]
if records[1]["exitCode"] == 0:
    browser = base + ["--project", "react-browser", "--maxWorkers=1", "--browser.fileParallelism=false", "--reporter=default", "--reporter=json", "--outputFile=" + str(OUT / "browser.json")]
    records.append(run("browser", browser))
after = source_fingerprint()
(OUT / "source-fingerprints-after.json").write_text(json.dumps(after, indent=2) + "\n")
changed = sorted(path for path in set(before) | set(after) if before.get(path) != after.get(path))
summary = {"completedAt": now(), "scope": "Original React jsdom/client-SSR and Chromium behavioral suites; no coverage, visual acceptance, Firefox, Safari or screen-reader claim.", "concurrency": "One jsdom worker; browser files sequential with one worker. Browser install overlaps jsdom; test suites do not overlap.", "records": records, "sourceAndLockfileChanges": changed}
(OUT / "run-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"commands": [{"name": r["name"], "exitCode": r["exitCode"]} for r in records], "sourceAndLockfileChanges": changed}, ensure_ascii=False), flush=True)
