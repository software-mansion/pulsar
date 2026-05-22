"""Command-line entry point for pulsar-lottie."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from typing import Optional

import typer

from . import emitter, events, features, mapper, parser, sampler

app = typer.Typer(add_completion=False, help="Generate Pulsar haptic patterns from Lottie animations.")


def _run(input_path: Path, output_path: Optional[Path], dry_run: bool, verbose: bool) -> dict:
    if verbose:
        logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    doc = parser.parse(input_path)
    times_s, tracks = sampler.sample(doc)
    signals = features.extract(doc, times_s, tracks)
    detected = events.detect(doc, signals)
    primitives = mapper.map_events(detected)
    pattern = emitter.build(doc, primitives)

    if verbose:
        typer.echo(
            f"layers={len(doc.layers)} tracks={len(doc.tracks)} "
            f"duration_ms={pattern['source']['duration_ms']} "
            f"transients={len(primitives.transients)} continuous={len(primitives.continuous)}",
            err=True,
        )

    if dry_run:
        stats = {
            "framerate": doc.framerate,
            "duration_ms": pattern["source"]["duration_ms"],
            "layers": len(doc.layers),
            "tracks": len(doc.tracks),
            "transients": len(primitives.transients),
            "continuous": len(primitives.continuous),
        }
        typer.echo(json.dumps(stats, indent=2))
        return pattern

    if output_path is None:
        typer.echo(json.dumps(pattern, indent=2))
    else:
        emitter.write(pattern, output_path)
        if verbose:
            typer.echo(f"wrote {output_path}", err=True)
    return pattern


@app.command()
def main(
    input: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Lottie JSON input"),
    output: Optional[Path] = typer.Option(None, "-o", "--output", help="Where to write the pattern (stdout if omitted)"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Print stats only; don't write output"),
    verbose: bool = typer.Option(False, "--verbose", help="Enable info-level logging"),
) -> None:
    """Convert a Lottie animation into a Pulsar haptic pattern."""
    try:
        _run(input, output, dry_run, verbose)
    except Exception as exc:  # pragma: no cover - thin CLI shell
        typer.echo(f"error: {exc}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    app()
