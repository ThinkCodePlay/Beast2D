import { NOTE_RANGE, toStepVolume, type SoundStep, type WaveformType } from './model.js';

/** First audition uses the previously discussed SPD 16, about 133 ms/step. */
export const STEP_SECONDS = 0.133;
const EDGE_SECONDS = 0.003;

export function noteFrequency(note: number): number {
  const valid = Number.isFinite(note) ? note : 60;
  const semitone = Math.max(NOTE_RANGE.min, Math.min(NOTE_RANGE.max, Math.round(valid)));
  return 440 * 2 ** ((semitone - 69) / 12);
}

export function normalizedVolume(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** Level trim so the six shapes sound about equally loud (measured RMS, sine is the reference). */
const WAVEFORM_TRIM: Record<WaveformType, number> = {
  sine: 1, triangle: 1, square: 0.5, saw: 0.8, pulse: 0.9, noise: 0.6,
};
const OSCILLATOR_TYPES = { sine: 'sine', square: 'square', saw: 'sawtooth', triangle: 'triangle' } as const;
const PULSE_DUTY = 0.25;
const PULSE_HARMONICS = 64;
const NOISE_SECONDS = 1;

const pulseWaves = new WeakMap<BaseAudioContext, PeriodicWave>();
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** 25% pulse as a Fourier series, with no DC offset. */
function pulseWave(context: BaseAudioContext): PeriodicWave {
  let wave = pulseWaves.get(context);
  if (!wave) {
    const real = new Float32Array(PULSE_HARMONICS + 1);
    const imag = new Float32Array(PULSE_HARMONICS + 1);
    for (let n = 1; n <= PULSE_HARMONICS; n++) {
      real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * PULSE_DUTY);
      imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(n * Math.PI * PULSE_DUTY));
    }
    wave = context.createPeriodicWave(real, imag);
    pulseWaves.set(context, wave);
  }
  return wave;
}

/** One shared second of white noise from a fixed seed, so every Play sounds the same. */
function noiseBuffer(context: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(context);
  if (!buffer) {
    buffer = context.createBuffer(1, Math.round(context.sampleRate * NOISE_SECONDS), context.sampleRate);
    const samples = buffer.getChannelData(0);
    let seed = 1;
    for (let i = 0; i < samples.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      samples[i] = seed / 2 ** 31 - 1;
    }
    noiseBuffers.set(context, buffer);
  }
  return buffer;
}

function createSource(context: BaseAudioContext, waveform: WaveformType, note: number, when: number): AudioScheduledSourceNode {
  if (waveform === 'noise') {
    // Noise has no pitch: the step's note is ignored, its volume and timing still apply.
    const source = context.createBufferSource();
    source.buffer = noiseBuffer(context);
    source.loop = true;
    return source;
  }
  const oscillator = context.createOscillator();
  if (waveform === 'pulse') oscillator.setPeriodicWave(pulseWave(context));
  else oscillator.type = OSCILLATOR_TYPES[waveform];
  oscillator.frequency.setValueAtTime(noteFrequency(note), when);
  return oscillator;
}

/** One disposable voice. Silent slots are handled by the player. */
export function scheduleVoice(
  context: BaseAudioContext,
  output: AudioNode,
  step: SoundStep,
  waveform: WaveformType,
  when: number,
  duration = STEP_SECONDS,
): AudioScheduledSourceNode {
  const source = createSource(context, waveform, step.note, when);
  const envelope = context.createGain();
  const edge = Math.min(EDGE_SECONDS, duration / 4);
  const volume = (toStepVolume(step.volume) / 7) * WAVEFORM_TRIM[waveform];
  envelope.gain.setValueAtTime(0, when);
  envelope.gain.linearRampToValueAtTime(volume, when + edge);
  envelope.gain.setValueAtTime(volume, when + duration - edge);
  envelope.gain.linearRampToValueAtTime(0, when + duration);
  source.connect(envelope).connect(output);
  source.addEventListener('ended', () => {
    source.disconnect();
    envelope.disconnect();
  }, { once: true });
  source.start(when);
  source.stop(when + duration);
  return source;
}
