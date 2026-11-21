import { NOTE_RANGE, toStepVolume, type SoundStep } from './model.js';

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

/** One disposable sine voice. Silent slots are handled by the player. */
export function scheduleSine(
  context: BaseAudioContext,
  output: AudioNode,
  step: SoundStep,
  when: number,
  duration = STEP_SECONDS,
): OscillatorNode {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const edge = Math.min(EDGE_SECONDS, duration / 4);
  const volume = toStepVolume(step.volume) / 7;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(noteFrequency(step.note), when);
  envelope.gain.setValueAtTime(0, when);
  envelope.gain.linearRampToValueAtTime(volume, when + edge);
  envelope.gain.setValueAtTime(volume, when + duration - edge);
  envelope.gain.linearRampToValueAtTime(0, when + duration);
  oscillator.connect(envelope).connect(output);
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect();
    envelope.disconnect();
  }, { once: true });
  oscillator.start(when);
  oscillator.stop(when + duration);
  return oscillator;
}
