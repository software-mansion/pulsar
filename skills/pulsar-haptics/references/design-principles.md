# Haptic Design Principles

## Use Haptics Intentionally

- Add haptics to attract attention, confirm a state change, or reinforce a deliberate physical interaction.
- Build a clear causal relationship between an action and its haptic. Trigger feedback when the selection lands, action completes, boundary is crossed, or error occurs.
- Avoid feedback for passive reading, ordinary scrolling, hover, or low-information layout changes.
- Use haptics as enhancement, not decoration. If feedback has no clear meaning, omit it.

## Choose Appropriate Feedback

- Use platform-defined patterns according to their documented meanings. Do not reuse a success, warning, error, selection, or impact pattern for a conflicting outcome.
- Prefer clear haptics for discrete events: crisp taps, ticks, detents, and mechanical impacts.
- Reserve rich haptics—textures, envelopes, and sequences—for interactions whose meaning benefits from added expression. Provide a simpler fallback.
- Avoid buzzy feedback with sharp, noisy, or lingering vibration. For routine touch feedback, no haptic is better than a poor one; attention-critical notifications may use vibration when clearer effects are unavailable.
- Match the physical metaphor and stakes. Routine UI needs less intensity than destructive actions, collisions, or other substantial events.

## Maintain Consistency and Hierarchy

- Keep a small vocabulary. Use the same haptic for the same meaning throughout the app, and distinct haptics for opposing outcomes.
- Make frequent feedback, such as fine adjustments or repeated ticks, very subtle. Reserve stronger feedback for rare or important events.
- Increase intensity only when it communicates progression, such as approaching a snap point or interaction target.
- Emit one haptic per meaningful action unless a deliberate sequence communicates distinct phases.

## Coordinate Timing and Modalities

- Design haptic, visual, and audio feedback together. Match their timing, intensity, sharpness, and meaning.
- Pair errors, warnings, and safety-critical feedback with visual or audio cues. Never make haptics the only information channel.
- Trigger feedback only after the corresponding state change is known; premature or delayed feedback breaks causality.
- Check that vibration does not degrade camera, microphone, gyroscope, or other sensor-dependent experiences.

## Control Duration and Frequency

- Prefer short haptics for discrete app events. Long-running feedback can lose meaning, distract, or become uncomfortable.
- Use sustained haptics only when they track an active, immersive interaction. Stop them immediately when that interaction ends or cancels.
- Do not vibrate continuously through long background work. Prefer start and completion cues; make essential progress feedback sparse and user-controlled.
- Avoid overuse. Repetition causes fatigue, reduces salience, and can lead users to disable all haptics.
- Do not use alarming or repetitive feedback to manipulate paywall, consent, or opt-out decisions.

## Design Custom Patterns Carefully

- Prefer a platform-semantic preset when one communicates the intended meaning. Create a custom pattern only when timing, texture, or interaction dynamics require it.
- Use transient events for taps, ticks, impacts, and rhythm. Use continuous envelopes for sustained effects that evolve over time.
- Keep amplitude and frequency values within `0...1`; start conservatively and tune on hardware.
- Use lower frequency for softer sensations and higher frequency for crisper sensations where hardware supports frequency control.
- Align pattern duration with interaction duration. A tap must not produce a lingering sequence.
- Use RealtimeComposer when live interaction values drive output, and stop it on completion, cancellation, interruption, or unmount.

## Preserve Accessibility and User Control

- Respect system haptic settings and provide an in-app off switch for frequent or expressive feedback.
- Keep every flow understandable and usable without tactile feedback.
- Offer intensity choices when haptics are central to an accessibility-focused experience.
- Expect perception to vary with sensory sensitivity, neuropathy, age, grip, device, and actuator hardware.
- Test with representative users and physical devices. Simulator audio does not validate tactile quality.

## Account for Platform Behavior

- On Apple platforms, let standard controls provide their built-in haptics and use predefined feedback categories for their intended meanings. Custom haptics require supported hardware.
- On Android, prefer action-oriented system effects for standard interactions so platform semantics and compatibility fallbacks remain intact. Avoid raw, long one-shot or waveform vibration for routine UI feedback.
- On Android, treat rich effects as enhancements because fidelity varies with OS version, vendor implementation, and actuator hardware.
- In React Native, preserve lifecycle cleanup and graceful platform degradation even when calls are worklet-compatible.
