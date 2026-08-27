import { createCanvasParticles } from './canvas';
import type { FieldOptions, ParticleField } from './types';

export * from './types';

/**
 * Picks the best available particle backend. WebGPU is tried first; anything
 * that goes wrong (no `navigator.gpu`, no adapter, a shader that fails to
 * compile on an odd driver) falls back to Canvas 2D rather than taking the
 * game down with it.
 *
 * `options.forceCanvas` skips the attempt entirely, which is how a field is
 * rebuilt after the GPU has already been lost once on this page.
 */
export async function createParticleField(
  canvas: HTMLCanvasElement,
  options: FieldOptions = {},
): Promise<ParticleField> {
  if (!options.forceCanvas && typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      // Loaded lazily so browsers without WebGPU never download TypeGPU.
      const { createGpuParticles } = await import('./gpu');
      return await createGpuParticles(canvas, options);
    } catch (error) {
      console.warn('[shape] WebGPU particles unavailable, using Canvas 2D:', error);
    }
  }
  return createCanvasParticles(canvas);
}
