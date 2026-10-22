#!/usr/bin/env python3
"""Download the unchanged official artifact in ranges and verify its full hash."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import base64
import hashlib
import json
import re
import shlex
import shutil
import subprocess
import tempfile
import time
import zipfile

OUT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[4]
DEST = Path.home() / "Library/Caches/ms-playwright/chromium_headless_shell-1243"
URL = "https://storage.googleapis.com/chrome-for-testing-public/153.0.8010.12/mac-arm64/chrome-headless-shell-mac-arm64.zip"
headers = (OUT / "chromium-download-headers.txt").read_text()
size = int(re.findall(r"content-length:\s*(\d+)", headers, re.I)[-1])
expected_md5 = re.findall(r"x-goog-hash:\s*md5=([^\r\n]+)", headers, re.I)[-1].strip()
temp = Path(tempfile.mkdtemp(prefix="heroui-browser-1243-ranged-"))
started = time.monotonic()
record = {"startedAt": datetime.now(timezone.utc).isoformat(), "officialUrl": URL, "urlProvenance": "Official Playwright CDN redirect recorded in chromium-download-headers.txt", "revision": "1243", "expectedVersion": "153.0.8010.12", "destination": str(DEST), "reason": "Single-stream curl was manually interrupted after 185 seconds because throughput was 50–80 KB/s; use 8 HTTP ranges to the identical public Google Storage artifact, verifying each Content-Range and the full official MD5.", "commands": []}


def run(name, args):
    entry = {"name": name, "command": args, "shellDisplay": shlex.join(args)}
    with (OUT / (name + ".log")).open("w") as log:
        log.write("Command: " + entry["shellDisplay"] + "\n"); log.flush()
        p = subprocess.run(args, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
    entry["exitCode"] = p.returncode
    record["commands"].append(entry)
    if p.returncode: raise RuntimeError(name + " failed")


def part(index):
    start = size * index // 8
    end = size * (index + 1) // 8 - 1
    path = temp / (str(index) + ".part")
    head = OUT / ("chromium-range-" + str(index) + ".headers")
    run("chromium-range-" + str(index), ["curl", "--location", "--fail", "--retry", "1", "--connect-timeout", "15", "--max-time", "600", "--range", str(start) + "-" + str(end), "--dump-header", str(head), "--output", str(path), URL])
    actual_range = re.findall(r"content-range:\s*([^\r\n]+)", head.read_text(), re.I)[-1]
    assert actual_range.strip() == f"bytes {start}-{end}/{size}", "Unexpected Content-Range"
    assert path.stat().st_size == end - start + 1, "Unexpected range size"
    print("Range " + str(index) + " complete", flush=True)
    return path


try:
    assert not DEST.exists(), "Refusing to overwrite existing browser cache"
    with ThreadPoolExecutor(max_workers=8) as pool:
        parts = list(pool.map(part, range(8)))
    archive = temp / "chrome-headless-shell-mac-arm64.zip"
    with archive.open("wb") as target:
        for path in parts:
            with path.open("rb") as source: shutil.copyfileobj(source, target)
    data = archive.read_bytes()
    actual_md5 = base64.b64encode(hashlib.md5(data).digest()).decode()
    record["download"] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "officialGoogleStorageMd5Base64": expected_md5, "actualMd5Base64": actual_md5, "md5Matches": actual_md5 == expected_md5}
    assert actual_md5 == expected_md5, "Official archive hash mismatch"
    with zipfile.ZipFile(archive) as z:
        for name in z.namelist():
            path = Path(name)
            assert not path.is_absolute() and ".." not in path.parts and path.parts[0] == "chrome-headless-shell-mac-arm64", "Unexpected archive entry"
    DEST.mkdir()
    run("chromium-range-extract", ["unzip", "-q", str(archive), "-d", str(DEST)])
    version = subprocess.check_output([str(DEST / "chrome-headless-shell-mac-arm64/chrome-headless-shell"), "--version"], text=True).strip()
    record["actualVersionOutput"] = version
    assert record["expectedVersion"] in version, "Browser version mismatch"
    (DEST / "INSTALLATION_COMPLETE").touch()
    run("chromium-range-register", ["pnpm", "--filter", "@heroui/testing", "exec", "playwright", "install", "--only-shell", "chromium"])
    record["exitCode"] = 0
except Exception as error:
    record["exitCode"] = 1
    record["error"] = str(error)
    raise
finally:
    record["finishedAt"] = datetime.now(timezone.utc).isoformat()
    record["durationSeconds"] = round(time.monotonic() - started, 2)
    (OUT / "chromium-ranged-install.command.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    shutil.rmtree(temp)
    print(json.dumps({"exitCode":record["exitCode"],"durationSeconds":record["durationSeconds"]}), flush=True)
