#!/usr/bin/env python3
"""Scan printable strings extracted from binary Git blobs reachable from repository refs.

Only redacted rule/path/line metadata is printed. This is a heuristic scanner for
embedded printable credentials, not a semantic analysis of compressed/encrypted data.
"""
from __future__ import annotations

import json
import os
import pathlib
import subprocess
import sys
import tempfile


def run(command: list[str], *, input_data: bytes | None = None, text: bool = False):
    return subprocess.run(
        command,
        input=input_data,
        capture_output=True,
        check=False,
        text=text,
    )


def is_binary(data: bytes) -> bool:
    if not data:
        return False
    if b"\x00" in data:
        return True
    controls = sum(1 for byte in data if byte < 32 and byte not in (8, 9, 10, 12, 13))
    return controls / len(data) > 0.05


def main() -> int:
    listing = run(["git", "rev-list", "--objects", "--all"], text=True)
    if listing.returncode:
        print("Binary history scan could not enumerate reachable Git objects.")
        return 2

    paths_by_oid: dict[str, str] = {}
    for row in listing.stdout.splitlines():
        oid, separator, path = row.partition(" ")
        if len(oid) == 40:
            paths_by_oid.setdefault(oid, path if separator else "<path unavailable>")

    if not paths_by_oid:
        print("Binary history scan: no reachable Git objects found.")
        return 0

    binary_count = 0
    total_binary_bytes = 0
    with tempfile.TemporaryDirectory(prefix="layali-binary-history-") as tmp:
        root = pathlib.Path(tmp)
        manifest: dict[str, str] = {}
        cat = subprocess.Popen(
            ["git", "cat-file", "--batch"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        assert cat.stdin is not None and cat.stdout is not None

        try:
            for oid, source_path in paths_by_oid.items():
                cat.stdin.write((oid + "\n").encode("ascii"))
                cat.stdin.flush()
                header = cat.stdout.readline()
                if not header:
                    raise RuntimeError("git cat-file batch ended unexpectedly")
                parts = header.decode("ascii", errors="replace").strip().split()
                if len(parts) < 3 or parts[1] != "blob":
                    continue
                size = int(parts[2])
                data = cat.stdout.read(size)
                cat.stdout.read(1)  # trailing newline after the object body
                if not is_binary(data):
                    continue

                extracted = run(["strings", "-a", "-n", "6"], input_data=data)
                if extracted.returncode not in (0,):
                    continue
                if not extracted.stdout.strip():
                    continue

                (root / f"{oid}.txt").write_bytes(extracted.stdout)
                manifest[oid] = source_path
                binary_count += 1
                total_binary_bytes += size
        finally:
            cat.stdin.close()
            cat.wait()

        print(f"Binary blobs with printable strings scanned: {binary_count}")
        print(f"Binary blob bytes examined: {total_binary_bytes}")

        if not manifest:
            print("Gitleaks findings in binary strings: 0")
            return 0

        report_path = pathlib.Path(tempfile.gettempdir()) / "layali-gitleaks-binary-report.json"
        if report_path.exists():
            report_path.unlink()

        scan = run([
            "gitleaks", "dir", str(root),
            "--redact", "--no-banner", "--exit-code", "1",
            "--report-format", "json", "--report-path", str(report_path),
        ])
        if not report_path.exists():
            print("Gitleaks binary scan failed without a report; no secret values were printed.")
            return 2

        try:
            findings = json.loads(report_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            print("Gitleaks binary scan report could not be parsed; no secret values were printed.")
            return 2

        print(f"Gitleaks findings in binary strings: {len(findings)}")
        for finding in findings:
            file_name = pathlib.Path(str(finding.get("File", ""))).stem
            source_path = manifest.get(file_name, "<source path unavailable>")
            rule_id = str(finding.get("RuleID", "unknown"))
            start_line = finding.get("StartLine", "?")
            blob_prefix = file_name[:12]
            print(f"rule={rule_id} source_path={source_path} line={start_line} blob={blob_prefix}")

        if findings or scan.returncode != 0:
            return 1
        return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        # Avoid dumping object contents or secret-bearing subprocess output.
        print(f"Binary history scan failed safely: {type(error).__name__}")
        sys.exit(2)
