#!/usr/bin/env python3
"""Query the bundled Pulsar preset index without loading the full catalog."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


AXES = {
    "intensity": ("Gentle", "Substantial", "Bold"),
    "texture": ("Soft", "Flexible", "Rigid"),
    "shape": ("Peak", "Ramp", "Saw", "Impulses", "Bumps", "Pattern", "Solid"),
    "duration": ("Impulse", "Short", "Extended", "Long"),
}


def load_index(path: Path) -> list[dict[str, object]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("preset index must contain a JSON array")
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", help="Exact preset name or lower-camel method")
    parser.add_argument("--query", help="Case-insensitive text in name, method, or description")
    for axis, choices in AXES.items():
        parser.add_argument(f"--{axis}", choices=choices)
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()
    if args.limit < 1:
        parser.error("--limit must be at least 1")

    index_path = Path(__file__).resolve().parents[1] / "references/presets.json"
    try:
        records = load_index(index_path)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    name = args.name.casefold() if args.name else None
    query = args.query.casefold() if args.query else None
    results: list[dict[str, object]] = []
    for record in records:
        record_name = str(record["name"])
        method = str(record["method"])
        description = str(record["description"])
        tags = record["tags"]
        if name and name not in {record_name.casefold(), method.casefold()}:
            continue
        if query and query not in " ".join((record_name, method, description)).casefold():
            continue
        if any(getattr(args, axis) and tags[axis] != getattr(args, axis) for axis in AXES):
            continue
        results.append(record)

    results.sort(
        key=lambda record: (
            0 if name and name in {str(record["name"]).casefold(), str(record["method"]).casefold()} else 1,
            str(record["name"]).casefold(),
        )
    )
    print(json.dumps(results[: args.limit], ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
