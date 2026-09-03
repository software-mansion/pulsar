# preset-audio

Renders the audio simulation of a Pulsar preset — the same sound the
[presets playground](https://docs.swmansion.com/pulsar/presets-playground/) plays in the browser —
to a WAV or MP3 file.

Nothing about the synth is reimplemented here. The CLI imports the website's own
`AudioPatternUtility` (`docs/src/content/docs/components/Preset/audio-player.ts`) as-is and gives it
the two browser globals it reaches for: `OfflineAudioContext`, backed by `node-web-audio-api`, and a
stub `window.AudioContext` standing in for the playback context the CLI never uses. The rendered
buffer is then written to disk. If the playground's sound changes, so does this output.

## Setup

```bash
npm --prefix tools/preset-audio install
```

MP3 output shells out to `ffmpeg` (or `lame`); WAV output has no external dependency.

## Usage

```bash
node tools/preset-audio/src/cli.mjs Gavel
node tools/preset-audio/src/cli.mjs Gavel Anvil --out ./preset-audio --format wav
node tools/preset-audio/src/cli.mjs --all --bitrate 320k
node tools/preset-audio/src/cli.mjs --list
```

A preset is named (`Gavel`, resolved against `docs/src/content/docs/assets/presets`) or given as a
path to any preset `.json`.

| Option | Default | Meaning |
| --- | --- | --- |
| `--all` | — | render every preset in the docs assets folder |
| `--out <dir>` | `preset-audio` | output directory, created if missing |
| `--format <fmt>` | `mp3` | `mp3` or `wav` |
| `--bitrate <rate>` | `192k` | MP3 bitrate |
| `--list` | — | print available preset names |

Requires Node 23.6+ — the docs module is TypeScript, run through Node's type stripping.
