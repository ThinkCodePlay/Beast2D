import { SEQUENCE_STEP_COUNT, toStepVolume, WAVEFORM_TYPES, type SoundSequence } from './model.js';
import { normalizedVolume, scheduleVoice, STEP_SECONDS } from './synthesis.js';

const START_LEAD_SECONDS = 0.01;
const STOP_FADE_SECONDS = 0.008;

interface Playback {
  output: GainNode;
  voices: Set<AudioScheduledSourceNode>;
}

/** UI-free one-shot player. Each Play reads a snapshot, never the live editor. */
export class SoundPlayer {
  private context?: AudioContext;
  private playback?: Playback;
  private request = 0;
  private disposed = false;

  constructor(private readonly createContext = () => new AudioContext()) {}

  /** Call directly from a click/tap so browser audio permission can unlock. */
  async play(sequence: SoundSequence): Promise<void> {
    if (this.disposed) return;
    this.stop();
    const request = this.request;
    const snapshot = {
      waveform: WAVEFORM_TYPES.includes(sequence.waveform) ? sequence.waveform : 'sine',
      masterVolume: normalizedVolume(sequence.masterVolume),
      steps: sequence.steps.slice(0, SEQUENCE_STEP_COUNT).map(step => ({
        ...step,
        volume: Number.isFinite(step.volume) ? toStepVolume(step.volume) : 0,
      })),
    };
    const context = this.context ??= this.createContext();
    if (context.state !== 'running') await context.resume();
    // Stop or a newer Play may have arrived while permission was pending.
    if (this.disposed || request !== this.request) return;
    if (context.state !== 'running') throw new Error('Audio could not start. Tap Play to retry.');

    const output = context.createGain();
    output.gain.value = snapshot.masterVolume;
    output.connect(context.destination);
    const playback: Playback = { output, voices: new Set() };
    this.playback = playback;
    const start = context.currentTime + START_LEAD_SECONDS;
    try {
      snapshot.steps.forEach((step, index) => {
        if (!step.enabled || step.volume === 0) return;
        const voice = scheduleVoice(context, output, step, snapshot.waveform, start + index * STEP_SECONDS);
        playback.voices.add(voice);
        voice.addEventListener('ended', () => {
          playback.voices.delete(voice);
          if (playback.voices.size === 0) this.release(playback);
        }, { once: true });
      });
      if (playback.voices.size === 0) this.release(playback);
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  /** Fade active sound and cancel even voices whose scheduled start is later. */
  stop(): void {
    this.request++;
    const playback = this.playback;
    const context = this.context;
    if (!playback || !context) return;
    this.playback = undefined;
    const now = context.currentTime;
    playback.output.gain.cancelScheduledValues(now);
    playback.output.gain.setValueAtTime(playback.output.gain.value, now);
    playback.output.gain.linearRampToValueAtTime(0, now + STOP_FADE_SECONDS);
    for (const voice of playback.voices) voice.stop(now + STOP_FADE_SECONDS);
  }

  /** Release the hardware context when the owning board is destroyed. */
  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    if (this.context && this.context.state !== 'closed') await this.context.close();
  }

  private release(playback: Playback): void {
    playback.output.disconnect();
    if (this.playback === playback) this.playback = undefined;
  }
}
