#!/usr/bin/env python3
"""Build the compact skill preset index from canonical Pulsar preset JSON files."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


INTENSITIES = {"Gentle", "Substantial", "Bold"}
TEXTURES = {"Soft", "Flexible", "Rigid"}
SHAPES = {"Peak", "Ramp", "Saw", "Impulses", "Bumps", "Pattern", "Solid"}
DURATIONS = {"Impulse", "Short", "Extended", "Long"}
KNOWN_TAGS = INTENSITIES | TEXTURES | SHAPES | DURATIONS


def one_tag(tags: list[str], allowed: set[str], axis: str, source: Path) -> str:
    matches = [tag for tag in tags if tag in allowed]
    if not matches:
        raise ValueError(f"{source.name}: missing {axis} tag")
    if axis != "shape" and len(matches) != 1:
        raise ValueError(f"{source.name}: expected one {axis} tag, got {matches}")
    if axis == "shape" and len(matches) > 1:
        print(
            f"warning: {source.name}: multiple shape tags {matches}; using {matches[0]}",
            file=sys.stderr,
        )
    return matches[0]


def build_index(source_dir: Path) -> list[dict[str, object]]:
    if not source_dir.is_dir():
        raise ValueError(f"source directory does not exist: {source_dir}")

    records: list[dict[str, object]] = []
    seen: set[str] = set()
    for source in sorted(source_dir.glob("*.json"), key=lambda path: path.name.casefold()):
        data = json.loads(source.read_text(encoding="utf-8"))
        name = data.get("name")
        description = data.get("description")
        tags = data.get("tags")
        duration_ms = data.get("duration")

        if not isinstance(name, str) or not name:
            raise ValueError(f"{source.name}: invalid name")
        if name in seen:
            raise ValueError(f"{source.name}: duplicate name {name}")
        if not isinstance(description, str) or not description:
            raise ValueError(f"{source.name}: invalid description")
        if not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags):
            raise ValueError(f"{source.name}: invalid tags")
        unknown = set(tags) - KNOWN_TAGS
        if unknown:
            raise ValueError(f"{source.name}: unknown tags {sorted(unknown)}")
        if not isinstance(duration_ms, (int, float)) or duration_ms < 0:
            raise ValueError(f"{source.name}: invalid duration")

        seen.add(name)
        records.append(
            {
                "name": name,
                "method": name[0].lower() + name[1:],
                "description": description,
                "tags": {
                    "intensity": one_tag(tags, INTENSITIES, "intensity", source),
                    "texture": one_tag(tags, TEXTURES, "texture", source),
                    "shape": one_tag(tags, SHAPES, "shape", source),
                    "duration": one_tag(tags, DURATIONS, "duration", source),
                },
                "duration_ms": duration_ms,
            }
        )
    if not records:
        raise ValueError(f"no preset JSON files found in {source_dir}")
    return records


def serialize(records: list[dict[str, object]]) -> str:
    return json.dumps(records, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    skill_root = Path(__file__).resolve().parents[1]
    default_source = skill_root.parents[1] / "docs/src/content/docs/assets/presets"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=default_source)
    parser.add_argument("--output", type=Path, default=skill_root / "references/presets.json")
    parser.add_argument("--check", action="store_true", help="Fail if output is missing or stale")
    args = parser.parse_args()

    try:
        rendered = serialize(build_index(args.source.resolve()))
        output = args.output.resolve()
        if args.check:
            if not output.exists() or output.read_text(encoding="utf-8") != rendered:
                print(f"preset index is stale: {output}", file=sys.stderr)
                return 1
            print(f"preset index is current: {output}")
            return 0
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8")
        print(f"wrote {len(json.loads(rendered))} presets to {output}")
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
