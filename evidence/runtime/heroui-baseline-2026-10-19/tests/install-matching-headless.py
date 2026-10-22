#!/usr/bin/env python3
"""Use curl for the same official browser after the Node downloader times out."""
from datetime import datetime, timezone
from pathlib import Path
import base64
import hashlib
import json
import os
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
URL = "https://cdn.playwright.dev/builds/cft/153.0.8010.12/mac-arm64/chrome-headless-shell-mac-arm64.zip"
started = time.monotonic()
record = {"startedAt": datetime.now(timezone.utc).isoformat(), "reason": "Playwright's Node downloader timed out after 30000 ms on all five attempts; curl HEAD for the same official CDN and redirected Google Storage succeeded.", "officialUrl": URL, "revision": "1243", "expectedVersion": "153.0.8010.12", "destination": str(DEST), "commands": []}
temp = Path(tempfile.mkdtemp(prefix="heroui-browser-1243-"))


def command(args, log):
    entry = {"command": args, "shellDisplay": shlex.join(args)}
    log.write("Command: " + entry["shellDisplay"] + "\n")
    log.flush()
    process = subprocess.run(args, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
    entry["exitCode"] = process.returncode
    record["commands"].append(entry)
    if process.returncode:
        raise RuntimeError("Command failed: " + entry["shellDisplay"])


try:
    with (OUT / "chromium-curl-install.log").open("w") as log:
        assert not DEST.exists(), "Refusing to overwrite an existing browser cache"
        archive = temp / "chrome-headless-shell-mac-arm64.zip"
        headers = OUT / "chromium-download-headers.txt"
        command(["curl", "--location", "--fail", "--retry", "2", "--connect-timeout", "15", "--max-time", "300", "--dump-header", str(headers), "--output", str(archive), URL], log)
        payload = archive.read_bytes()
        expected = re.findall(r"x-goog-hash:\s*md5=([^\r\n]+)", headers.read_text(), re.I)[-1].strip()
        actual = base64.b64encode(hashlib.md5(payload).digest()).decode()
        record["download"] = {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest(), "officialGoogleStorageMd5Base64": expected, "actualMd5Base64": actual, "md5Matches": actual == expected}
        assert actual == expected, "Archive differs from official Google Storage content hash"
        with zipfile.ZipFile(archive) as z:
            for name in z.namelist():
                path = Path(name)
                assert not path.is_absolute() and ".." not in path.parts, "Unsafe archive entry"
                assert path.parts[0] == "chrome-headless-shell-mac-arm64", "Unexpected archive layout"
        DEST.mkdir()
        command(["unzip", "-q", str(archive), "-d", str(DEST)], log)
        executable = DEST / "chrome-headless-shell-mac-arm64/chrome-headless-shell"
        version = subprocess.check_output([str(executable), "--version"], text=True).strip()
        record["actualVersionOutput"] = version
        assert record["expectedVersion"] in version, "Browser version mismatch"
        (DEST / "INSTALLATION_COMPLETE").touch()
        command(["pnpm", "--filter", "@heroui/testing", "exec", "playwright", "install", "--only-shell", "chromium"], log)
    record["exitCode"] = 0
except Exception as error:
    record["exitCode"] = 1
    record["error"] = str(error)
    raise
finally:
    record["finishedAt"] = datetime.now(timezone.utc).isoformat()
    record["durationSeconds"] = round(time.monotonic() - started, 2)
    (OUT / "chromium-curl-install.command.json").write_text(json.dumps(record, indent=2) + "\n")
    shutil.rmtree(temp)
    print(json.dumps(record), flush=True)
