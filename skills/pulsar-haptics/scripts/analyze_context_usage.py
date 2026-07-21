#!/usr/bin/env python3
"""Measure context used by Pulsar Haptics skill loading scenarios.

The root ``SKILL.md`` is included in every scenario. Token counts use tiktoken
when installed; otherwise the script reports a clearly labelled 4-chars/token
estimate. No third-party dependency is required for the remaining metrics.
"""

from __future__ import annotations

import argparse
import csv
import io
import itertools
import json
import math
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import unquote, urlsplit


SKILL_ROOT = Path(__file__).resolve().parents[1]
ROOT_SKILL = SKILL_ROOT / "SKILL.md"
REFERENCES = SKILL_ROOT / "references"
MARKDOWN_LINK = re.compile(r"\[[^\]]+\]\(([^)]+)\)")

# Mirrors development routes in SKILL.md. Values intentionally exclude
# SKILL.md because measure_scenario() always inserts it.
SCENARIOS: dict[str, tuple[str, ...]] = {
    "core-guidance": (),
    "preset-selection": ("preset-selection.md",),
    "react-native-api": ("react-native-api.md",),
    "ios-api": ("ios-api.md",),
    "android-api": ("android-api.md",),
    "react-native-custom-pattern": ("pattern-composer.md", "react-native-api.md"),
    "ios-custom-pattern": ("pattern-composer.md", "ios-api.md"),
    "android-custom-pattern": ("pattern-composer.md", "android-api.md"),
    "platform-neutral-gesture": ("gesture-haptics.md",),
    "react-native-gesture": (
        "gesture-haptics.md",
        "gesture-haptics-react-native.md",
    ),
    "ios-gesture": ("gesture-haptics.md", "gesture-haptics-ios.md"),
    "android-gesture": ("gesture-haptics.md", "gesture-haptics-android.md"),
    "design-safety-accessibility": ("design-principles.md",),
    "expo-haptics-migration": ("react-native-migration.md",),
}


@dataclass(frozen=True)
class Usage:
    scenario: str
    files: list[str]
    tokens: int
    token_method: str
    lines: int
    words: int
    characters: int
    bytes: int
    kibibytes: float
    reading_minutes: float
    context_percent: dict[str, float]


class TokenCounter:
    def __init__(self, encoding_name: str) -> None:
        self.encoding_name = encoding_name
        self._encoding = None
        try:
            import tiktoken  # type: ignore[import-not-found]

            self._encoding = tiktoken.get_encoding(encoding_name)
        except (ImportError, ValueError):
            pass

    @property
    def method(self) -> str:
        if self._encoding is not None:
            return f"tiktoken:{self.encoding_name}"
        return "estimate:ceil(characters/4)"

    def count(self, text: str) -> int:
        if self._encoding is not None:
            return len(self._encoding.encode(text))
        return math.ceil(len(text) / 4)


def markdown_link_targets(path: Path) -> list[str]:
    targets: list[str] = []
    for match in MARKDOWN_LINK.finditer(path.read_text(encoding="utf-8")):
        destination = match.group(1).strip()
        if destination.startswith("<") and ">" in destination:
            destination = destination[1 : destination.index(">")]
        else:
            destination = destination.split(maxsplit=1)[0]
        targets.append(destination)
    return targets


def is_local_cross_file_link(target: str) -> bool:
    parsed = urlsplit(target)
    return not target.startswith("#") and not parsed.scheme and not parsed.netloc


def reference_graph_errors() -> list[str]:
    errors: list[str] = []
    reference_paths = sorted(REFERENCES.glob("*.md"))
    root_reference_targets: set[Path] = set()

    for target in markdown_link_targets(ROOT_SKILL):
        if not is_local_cross_file_link(target):
            continue
        destination = (SKILL_ROOT / unquote(urlsplit(target).path)).resolve()
        if not destination.is_file():
            errors.append(f"SKILL.md: unresolved local link: {target}")
        if destination.parent == REFERENCES.resolve() and destination.suffix == ".md":
            root_reference_targets.add(destination)

    for reference in reference_paths:
        if reference.resolve() not in root_reference_targets:
            errors.append(f"SKILL.md: missing direct link to references/{reference.name}")
        for target in markdown_link_targets(reference):
            if is_local_cross_file_link(target):
                errors.append(f"references/{reference.name}: cross-file link: {target}")

    return errors


def resolve_references(names: tuple[str, ...]) -> list[Path]:
    available = {path.name: path for path in REFERENCES.glob("*.md")}
    unknown = sorted(set(names) - available.keys())
    if unknown:
        raise ValueError(f"unknown reference(s): {', '.join(unknown)}")
    return [ROOT_SKILL, *(available[name] for name in names)]


def measure_scenario(
    name: str,
    references: tuple[str, ...],
    counter: TokenCounter,
    context_windows: tuple[int, ...],
) -> Usage:
    paths = resolve_references(references)
    texts = [path.read_text(encoding="utf-8") for path in paths]
    combined = "\n".join(texts)
    words = sum(len(text.split()) for text in texts)
    tokens = counter.count(combined)
    byte_count = sum(len(text.encode("utf-8")) for text in texts)
    return Usage(
        scenario=name,
        files=[path.name for path in paths],
        tokens=tokens,
        token_method=counter.method,
        lines=sum(len(text.splitlines()) for text in texts),
        words=words,
        characters=sum(len(text) for text in texts),
        bytes=byte_count,
        kibibytes=round(byte_count / 1024, 2),
        reading_minutes=round(words / 225, 1),
        context_percent={
            str(window): round(tokens / window * 100, 2)
            for window in context_windows
        },
    )


def all_combinations() -> dict[str, tuple[str, ...]]:
    names = sorted(path.name for path in REFERENCES.glob("*.md"))
    return {
        " + ".join(combo) if combo else "core-guidance": combo
        for size in range(len(names) + 1)
        for combo in itertools.combinations(names, size)
    }


def render_markdown(rows: list[Usage], context_windows: tuple[int, ...]) -> str:
    percent_headers = [f"{window:,} ctx" for window in context_windows]
    headers = [
        "Scenario",
        "Loaded files",
        "Tokens",
        "Words",
        "Lines",
        "KiB",
        "Read min",
        *percent_headers,
    ]
    output = [
        f"Token method: `{rows[0].token_method}`" if rows else "No scenarios.",
        "",
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        values = [
            row.scenario,
            " + ".join(row.files),
            f"{row.tokens:,}",
            f"{row.words:,}",
            f"{row.lines:,}",
            f"{row.kibibytes:,.2f}",
            f"{row.reading_minutes:.1f}",
            *(f"{row.context_percent[str(window)]:.2f}%" for window in context_windows),
        ]
        output.append("| " + " | ".join(values) + " |")
    return "\n".join(output) + "\n"


def render_csv(rows: list[Usage], context_windows: tuple[int, ...]) -> str:
    stream = io.StringIO()
    fields = [
        "scenario",
        "files",
        "tokens",
        "token_method",
        "lines",
        "words",
        "characters",
        "bytes",
        "kibibytes",
        "reading_minutes",
        *(f"context_{window}_percent" for window in context_windows),
    ]
    writer = csv.DictWriter(stream, fieldnames=fields)
    writer.writeheader()
    for row in rows:
        record = asdict(row)
        record["files"] = ";".join(row.files)
        record.pop("context_percent")
        record.update(
            {
                f"context_{window}_percent": row.context_percent[str(window)]
                for window in context_windows
            }
        )
        writer.writerow(record)
    return stream.getvalue()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument(
        "--scenario",
        action="append",
        choices=sorted(SCENARIOS),
        help="Measure one named scenario; repeat to select several",
    )
    selection.add_argument(
        "--refs",
        nargs="*",
        metavar="FILE.md",
        help="Measure one custom reference subset (SKILL.md is added automatically)",
    )
    selection.add_argument(
        "--all-combinations",
        action="store_true",
        help="Measure every possible Markdown reference subset",
    )
    parser.add_argument("--format", choices=("markdown", "json", "csv"), default="markdown")
    parser.add_argument("--encoding", default="cl100k_base", help="tiktoken encoding name")
    parser.add_argument(
        "--context-window",
        action="append",
        type=int,
        dest="context_windows",
        help="Token budget used for occupation percentage; repeatable",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    windows = tuple(args.context_windows or (32_768, 128_000))
    if any(window <= 0 for window in windows):
        print("error: context windows must be positive", file=sys.stderr)
        return 2

    if args.all_combinations:
        scenarios = all_combinations()
    elif args.refs is not None:
        scenarios = {"custom": tuple(args.refs)}
    elif args.scenario:
        scenarios = {name: SCENARIOS[name] for name in args.scenario}
    else:
        scenarios = SCENARIOS

    counter = TokenCounter(args.encoding)
    try:
        rows = [
            measure_scenario(name, references, counter, windows)
            for name, references in scenarios.items()
        ]
    except (OSError, UnicodeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    if args.format == "json":
        print(json.dumps([asdict(row) for row in rows], indent=2))
    elif args.format == "csv":
        print(render_csv(rows, windows), end="")
    else:
        print(render_markdown(rows, windows), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
