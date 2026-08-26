import { createCanvasParticles } from './canvas';
import type { ParticleField } from './types';

export * from './types';

/**
 * Picks the best available particle backend. WebGPU is tried first; anything
 * that goes wrong (no `navigator.gpu`, no adapter, a shader that fails to
 * compile on an odd driver) falls back to Canvas 2D rather than taking the
 * game down with it.
 */
export async function createParticleField(canvas: HTMLCanvasElement): Promise<ParticleField> {
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      // Loaded lazily so browsers without WebGPU never download TypeGPU.
      const { createGpuParticles } = await import('./gpu');
      return await createGpuParticles(canvas);
    } catch (error) {
      console.warn('[candy] WebGPU particles unavailable, using Canvas 2D:', error);
    }
  }
  return createCanvasParticles(canvas);
}
