import { SEQUENCE_STEP_COUNT, toStepVolume, WAVEFORM_TYPES, type SoundSequence, type SoundStep, type WaveformType } from './model.js';
import { normalizedVolume, scheduleVoice, STEP_SECONDS } from './synthesis.js';

import { validRate } from './rate.js';

const START_LEAD_SECONDS = 0.01;
const STOP_FADE_SECONDS = 0.008;
const PREVIEW_SECONDS = 0.1;
const PREVIEW_INTERVAL_SECONDS = 0.05;

interface Playback {
  output: GainNode;
  voices: Set<AudioScheduledSourceNode>;
}

/** UI-free one-shot player. Each Play reads a snapshot, never the live editor. */
export class SoundPlayer {
  private context?: AudioContext;
  private masterVolume = 0.25;
  private playback?: Playback;
  private sequenceRequested = false;
  private preview?: Playback;
  private previewTimer?: ReturnType<typeof setTimeout>;
  private previewRequest = 0;
  private lastPreviewAt = -Infinity;
  private request = 0;
  private disposed = false;

  constructor(private readonly createContext = () => new AudioContext()) {}

  /** Call directly from a click/tap so browser audio permission can unlock. */
  async play(sequence: SoundSequence): Promise<void> {
    if (this.disposed) return;
    this.stop();
    this.masterVolume = normalizedVolume(sequence.masterVolume);
    const request = this.request;
    this.sequenceRequested = true;
    const snapshot = {
      waveform: WAVEFORM_TYPES.includes(sequence.waveform) ? sequence.waveform : 'sine',
      stepSeconds: STEP_SECONDS / validRate(sequence.rate),
      steps: sequence.steps.slice(0, SEQUENCE_STEP_COUNT).map(step => ({
        ...step,
        volume: Number.isFinite(step.volume) ? toStepVolume(step.volume) : 0,
      })),
    };
    const context = this.context ??= this.createContext();
    try {
      if (context.state !== 'running') await context.resume();
    } catch (error) {
      if (request === this.request) this.sequenceRequested = false;
      throw error;
    }
    // Stop or a newer Play may have arrived while permission was pending.
    if (this.disposed || request !== this.request) return;
    if (context.state !== 'running') {
      this.sequenceRequested = false;
      throw new Error('Audio could not start. Tap Play to retry.');
    }

    const output = context.createGain();
    output.gain.value = this.masterVolume;
    output.connect(context.destination);
    const playback: Playback = { output, voices: new Set() };
    this.playback = playback;
    const start = context.currentTime + START_LEAD_SECONDS;
    try {
      snapshot.steps.forEach((step, index) => {
        if (!step.enabled || step.volume === 0) return;
        const voice = scheduleVoice(context, output, step, snapshot.waveform, start + index * snapshot.stepSeconds, snapshot.stepSeconds);
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

  /** Short, monophonic edit preview. Sequence playback always takes priority. */
  async audition(sequence: SoundSequence, index: number): Promise<void> {
    if (this.disposed || this.sequenceRequested) return;
    const step = sequence.steps[index];
    if (!step) return;
    const snapshot = { ...step };
    const waveform = WAVEFORM_TYPES.includes(sequence.waveform) ? sequence.waveform : 'sine';
    this.masterVolume = normalizedVolume(sequence.masterVolume);
    const request = ++this.previewRequest;
    clearTimeout(this.previewTimer);
    this.previewTimer = undefined;
    // Create/resume inside the pointer gesture, not inside the trailing timer.
    const context = this.context ??= this.createContext();
    if (context.state !== 'running') await context.resume();
    if (this.disposed || this.sequenceRequested || request !== this.previewRequest) return;
    if (context.state !== 'running') return;
    if (!snapshot.enabled || !Number.isFinite(snapshot.volume) || snapshot.volume <= 0 || this.masterVolume === 0) {
      this.fade(this.preview);
      this.preview = undefined;
      return;
    }
    const start = (): void => {
      this.previewTimer = undefined;
      if (this.disposed || this.sequenceRequested || request !== this.previewRequest) return;
      this.startPreview(context, snapshot, waveform);
    };
    const delay = this.lastPreviewAt + PREVIEW_INTERVAL_SECONDS - context.currentTime;
    if (delay > 0) this.previewTimer = setTimeout(start, delay * 1000);
    else start();
  }

  private startPreview(context: AudioContext, step: SoundStep, waveform: WaveformType): void {
    this.fade(this.preview);
    this.preview = undefined;
    this.lastPreviewAt = context.currentTime;
    const output = context.createGain();
    output.gain.value = this.masterVolume;
    output.connect(context.destination);
    const preview: Playback = { output, voices: new Set() };
    this.preview = preview;
    try {
      const voice = scheduleVoice(context, output, step, waveform, context.currentTime, PREVIEW_SECONDS);
      preview.voices.add(voice);
      voice.addEventListener('ended', () => this.release(preview), { once: true });
    } catch (error) {
      this.release(preview);
      throw error;
    }
  }

  /** Live master gain, shared by playback and edit previews, without changing steps. */
  setMasterVolume(value: number): void {
    this.masterVolume = normalizedVolume(value);
    if (!this.context) return; // Turning VOL alone must not unlock/create audio.
    const now = this.context.currentTime;
    for (const sound of [this.playback, this.preview]) {
      if (!sound) continue;
      const gain = sound.output.gain;
      gain.cancelAndHoldAtTime(now);
      gain.linearRampToValueAtTime(this.masterVolume, now + STOP_FADE_SECONDS);
    }
  }

  /** Fade active sound and cancel even voices whose scheduled start is later. */
  stop(): void {
    this.request++;
    this.sequenceRequested = false;
    this.previewRequest++;
    clearTimeout(this.previewTimer);
    this.previewTimer = undefined;
    this.lastPreviewAt = -Infinity;
    this.fade(this.playback);
    this.fade(this.preview);
    this.playback = undefined;
    this.preview = undefined;
  }

  private fade(playback?: Playback): void {
    const context = this.context;
    if (!playback || !context) return;
    const now = context.currentTime;
    playback.output.gain.cancelAndHoldAtTime(now);
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
    if (this.playback === playback) {
      this.playback = undefined;
      this.sequenceRequested = false;
    }
    if (this.preview === playback) this.preview = undefined;
  }
}
