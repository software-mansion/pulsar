import { useId, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import type { Pattern } from 'react-native-pulsar';
import Svg, {
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const NAVY = '#001A72';
const FLAT_FILL = '#B5E1F1';
const FLAT_STROKE = '#38ACDD';
const HEIGHT = 120;
const INSET = 3;
const UNPLAYED_OPACITY = 0.3;

/** Frequency → hue, matching the Figma plugin: 0 → blue (220°), 1 → warm (20°). */
const freqColor = (f: number) => `hsl(${Math.round(220 - clamp01(f) * 200)}, 70%, 45%)`;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * The pattern as the Figma plugin draws it: an amplitude envelope anchored to the
 * baseline, tinted along the time axis by the continuous frequency, with one bar per
 * discrete impulse coloured by its own frequency. What has played is drawn at full
 * strength over a faded copy of the whole pattern, so `progress` (0..1, off the same
 * clock as the haptics) reads as the pattern filling in.
 */
export default function PatternCanvas({
  pattern,
  durationMs,
  progress,
}: {
  pattern: Pattern;
  durationMs: number;
  progress: number;
}) {
  const [size, setSize] = useState({ width: 0, height: HEIGHT });
  const onLayout = (e: LayoutChangeEvent) => setSize(e.nativeEvent.layout);
  const gradientId = `pulsar-freq-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const { width, height } = size;
  const amplitudePoints = pattern.continuousPattern.amplitude;
  const frequencyPoints = pattern.continuousPattern.frequency;

  const span = Math.max(durationMs, 1);
  const xOf = (timeMs: number) => (timeMs / span) * (width - INSET * 2) + INSET;
  const yOf = (value: number) => height - clamp01(value) * (height - INSET * 2) - INSET;

  const envelopeLine =
    width > 0 && amplitudePoints.length > 0
      ? amplitudePoints
          .map(
            (p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.time).toFixed(1)},${yOf(p.value).toFixed(1)}`,
          )
          .join(' ')
      : '';
  const envelopeArea = envelopeLine
    ? `${envelopeLine} L${xOf(span)},${height} L${xOf(0)},${height} Z`
    : '';

  // A gradient needs two stops; a single frequency point is a flat tint instead.
  const gradientTint = frequencyPoints.length > 1;
  const fill = gradientTint
    ? `url(#${gradientId})`
    : frequencyPoints.length === 1
      ? freqColor(frequencyPoints[0].value)
      : FLAT_FILL;
  const stroke = gradientTint
    ? `url(#${gradientId})`
    : frequencyPoints.length === 1
      ? freqColor(frequencyPoints[0].value)
      : FLAT_STROKE;

  const drawPattern = () => (
    <>
      {!!envelopeLine && <Path d={envelopeArea} fill={fill} opacity={0.45} />}
      {!!envelopeLine && <Path d={envelopeLine} stroke={stroke} strokeWidth={2} fill="none" />}
      {pattern.discretePattern.map((event, index) => (
        <Line
          key={`${event.time}-${index}`}
          x1={xOf(event.time)}
          x2={xOf(event.time)}
          y1={height - INSET}
          y2={yOf(event.amplitude)}
          stroke={freqColor(event.frequency)}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
    </>
  );

  const playedWidth = width * clamp01(progress);

  return (
    <View style={styles.canvas}>
      <View style={styles.plot} onLayout={onLayout}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              {gradientTint && (
                <LinearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1={xOf(0)}
                  y1={0}
                  x2={xOf(span)}
                  y2={0}
                >
                  {frequencyPoints.map((p, i) => (
                    <Stop
                      key={i}
                      offset={clamp01(p.time / span)}
                      stopColor={freqColor(p.value)}
                    />
                  ))}
                </LinearGradient>
              )}
              <ClipPath id={`${gradientId}-played`}>
                <Rect x={0} y={0} width={playedWidth} height={height} />
              </ClipPath>
            </Defs>

            <Line
              x1={0}
              y1={height - INSET}
              x2={width}
              y2={height - INSET}
              stroke={FLAT_FILL}
              strokeWidth={1}
            />
            <G opacity={UNPLAYED_OPACITY}>{drawPattern()}</G>
            <G clipPath={`url(#${gradientId}-played)`}>{drawPattern()}</G>

            {playedWidth > 0 && (
              <Line
                x1={playedWidth}
                y1={0}
                x2={playedWidth}
                y2={height}
                stroke={NAVY}
                strokeWidth={1.5}
              />
            )}
          </Svg>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: HEIGHT,
    borderRadius: 4,
    backgroundColor: '#E1F3FA',
    borderWidth: 2,
    borderColor: '#B5E1F1',
    overflow: 'hidden',
    marginBottom: 12,
  },
  plot: { flex: 1 },
});
