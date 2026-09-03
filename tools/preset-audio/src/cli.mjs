#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { OfflineAudioContext } from 'node-web-audio-api';

// AudioPatternUtility renders into an OfflineAudioContext taken from the global
// scope, and keeps a live AudioContext around for playback we never use here.
globalThis.OfflineAudioContext = OfflineAudioContext;
globalThis.window = {
  AudioContext: class {
    state = 'running';
    async resume() {}
  },
};

const { AudioPatternUtility } = await import(
  '../../../docs/src/content/docs/components/Preset/audio-player.ts'
);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PRESETS_DIR = path.join(ROOT, 'docs/src/content/docs/assets/presets');

const USAGE = `Usage: node tools/preset-audio/src/cli.mjs <preset...> [options]

  <preset>            preset name (Gavel) or path to a preset .json file
  --all               render every preset in docs/src/content/docs/assets/presets
  --out <dir>         output directory (default: ./preset-audio)
  --format <fmt>      mp3 (default) or wav
  --bitrate <rate>    mp3 bitrate (default: 192k)
  --list              print available preset names and exit
`;

function parseArgs(argv) {
  const options = { presets: [], all: false, out: 'preset-audio', format: 'mp3', bitrate: '192k' };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--all':
        options.all = true;
        break;
      case '--out':
        options.out = argv[++i];
        break;
      case '--format':
        options.format = argv[++i];
        break;
      case '--bitrate':
        options.bitrate = argv[++i];
        break;
      case '--list':
        options.list = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        options.presets.push(arg);
    }
  }

  return options;
}

function availablePresets() {
  return fs
    .readdirSync(PRESETS_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'))
    .sort();
}

function resolvePreset(preset) {
  if (preset.endsWith('.json')) {
    const asPath = path.resolve(preset);
    if (!fs.existsSync(asPath)) {
      throw new Error(`No preset file at ${asPath}`);
    }
    return asPath;
  }

  const byName = path.join(PRESETS_DIR, `${preset}.json`);
  if (fs.existsSync(byName)) {
    return byName;
  }

  throw new Error(`Unknown preset "${preset}". Run with --list to see available names.`);
}

function encodeWav(buffer) {
  const samples = buffer.getChannelData(0);
  const bytes = Buffer.alloc(44 + samples.length * 2);

  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + samples.length * 2, 4);
  bytes.write('WAVE', 8);
  bytes.write('fmt ', 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); // PCM
  bytes.writeUInt16LE(1, 22); // mono
  bytes.writeUInt32LE(buffer.sampleRate, 24);
  bytes.writeUInt32LE(buffer.sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples.length * 2, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    bytes.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  return bytes;
}

function findEncoder() {
  for (const command of ['ffmpeg', 'lame']) {
    if (spawnSync(command, ['-version'], { stdio: 'ignore' }).status === 0) {
      return command;
    }
  }
  return null;
}

function encodeMp3(wav, outPath, bitrate, encoder) {
  const tmpWav = path.join(os.tmpdir(), `preset-audio-${process.pid}-${path.basename(outPath)}.wav`);
  fs.writeFileSync(tmpWav, wav);

  const args =
    encoder === 'ffmpeg'
      ? ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmpWav, '-codec:a', 'libmp3lame', '-b:a', bitrate, outPath]
      : ['--quiet', '-b', parseInt(bitrate, 10).toString(), tmpWav, outPath];

  try {
    const result = spawnSync(encoder, args, { stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`${encoder} failed to encode ${outPath}`);
    }
  } finally {
    fs.rmSync(tmpWav, { force: true });
  }
}

async function renderPreset(presetPath, options, encoder) {
  const pattern = JSON.parse(fs.readFileSync(presetPath, 'utf8'));

  const player = new AudioPatternUtility();
  await player.parsePattern(pattern);
  const buffer = player.getBufferInfo()?.renderedBuffer;

  if (!buffer) {
    throw new Error(`${path.basename(presetPath)} produced no audio`);
  }

  const wav = encodeWav(buffer);
  const name = pattern.name ?? path.basename(presetPath, '.json');
  const outPath = path.join(options.out, `${name}.${options.format}`);

  if (options.format === 'wav') {
    fs.writeFileSync(outPath, wav);
  } else {
    encodeMp3(wav, outPath, options.bitrate, encoder);
  }

  console.log(`${outPath} (${buffer.duration.toFixed(3)}s)`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(USAGE);
    return;
  }

  if (options.list) {
    console.log(availablePresets().join('\n'));
    return;
  }

  if (options.format !== 'mp3' && options.format !== 'wav') {
    throw new Error(`Unsupported format "${options.format}". Use mp3 or wav.`);
  }

  const presets = options.all
    ? availablePresets().map((name) => path.join(PRESETS_DIR, `${name}.json`))
    : options.presets.map(resolvePreset);

  if (presets.length === 0) {
    console.log(USAGE);
    process.exitCode = 1;
    return;
  }

  let encoder = null;
  if (options.format === 'mp3') {
    encoder = findEncoder();
    if (!encoder) {
      throw new Error('mp3 output needs ffmpeg or lame on PATH. Install one, or pass --format wav.');
    }
  }

  fs.mkdirSync(options.out, { recursive: true });

  for (const presetPath of presets) {
    await renderPreset(presetPath, options, encoder);
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
