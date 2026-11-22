import {
  SEQUENCE_STEP_COUNT,
  toStepVolume,
  WAVEFORM_TYPES,
  type SoundSequence,
  type SoundStep,
  type WaveformType,
} from "./model.js";
import {
  normalizedVolume,
  scheduleVoice,
  STEP_SECONDS,
  type VoiceTuning,
} from "./synthesis.js";
import {
  cutoffFromDial,
  panFromDial,
  ringShareFromDial,
  validPitch,
} from "./effects.js";

import { validRate } from "./rate.js";

const START_LEAD_SECONDS = 0.01;
const STOP_FADE_SECONDS = 0.008;
const PREVIEW_SECONDS = 0.1;
const PREVIEW_INTERVAL_SECONDS = 0.05;
/** The next loop pass is scheduled this far ahead of the pass boundary. */
const LOOP_LOOKAHEAD_SECONDS = 0.25;
/** The pass-boundary timer never sleeps longer than this, so toggles stay responsive. */
const LOOP_TIMER_CAP_MS = 100;

interface SequenceSnapshot {
  waveform: WaveformType;
  stepSeconds: number;
  passSeconds: number;
  steps: SoundStep[];
  /** Per-note fade, read at Play like RATE; dials turned later apply to the next Play. */
  decayShare: number;
  /** Whole-sound semitone shift, snapshotted with the rest of the pass. */
  pitchShift: number;
}

interface Playback {
  /** Channel input: gain, then low-pass filter, then stereo panner, out. */
  output: GainNode;
  filter: BiquadFilterNode;
  panner: StereoPannerNode;
  voices: Set<AudioScheduledSourceNode>;
  snapshot?: SequenceSnapshot;
  /** Audio-clock time the next pass starts at, looping or not. */
  nextPassStart?: number;
  /** The single pending pass-boundary check. */
  loopTimer?: ReturnType<typeof setTimeout>;
  /** One-shot playback (preset audition): never loops, even when the latch is on. */
  once?: boolean;
}

/** UI-free one-shot player. Each Play reads a snapshot, never the live editor. */
export class SoundPlayer {
  private context?: AudioContext;
  private masterVolume = 0.25;
  private panDial = 0.5;
  private cutDial = 1;
  private loopEnabled = false;
  private playback?: Playback;
  private sequenceRequested = false;
  private preview?: Playback;
  private previewTimer?: ReturnType<typeof setTimeout>;
  private previewRequest = 0;
  private lastPreviewAt = -Infinity;
  private request = 0;
  private disposed = false;

  constructor(private readonly createContext = () => new AudioContext()) {}

  /**
   * Call directly from a click/tap so browser audio permission can unlock.
   * With `once: true` the sound plays a single pass and stops, whatever the
   * loop latch says; the latch itself is untouched and still applies to the
   * next regular Play.
   */
  async play(
    sequence: SoundSequence,
    options?: { once?: boolean },
  ): Promise<void> {
    if (this.disposed) return;
    this.stop();
    this.masterVolume = normalizedVolume(sequence.masterVolume);
    this.panDial = normalizedVolume(sequence.pan);
    this.cutDial = normalizedVolume(sequence.cut);
    const request = this.request;
    this.sequenceRequested = true;
    const stepSeconds = STEP_SECONDS / validRate(sequence.rate);
    const snapshot: SequenceSnapshot = {
      waveform: WAVEFORM_TYPES.includes(sequence.waveform)
        ? sequence.waveform
        : "sine",
      stepSeconds,
      passSeconds: SEQUENCE_STEP_COUNT * stepSeconds,
      steps: sequence.steps.slice(0, SEQUENCE_STEP_COUNT).map((step) => ({
        ...step,
        volume: Number.isFinite(step.volume) ? toStepVolume(step.volume) : 0,
      })),
      decayShare: ringShareFromDial(sequence.decay),
      pitchShift: validPitch(sequence.pitch),
    };
    const context = (this.context ??= this.createContext());
    try {
      if (context.state !== "running") await context.resume();
    } catch (error) {
      if (request === this.request) this.sequenceRequested = false;
      throw error;
    }
    // Stop or a newer Play may have arrived while permission was pending.
    if (this.disposed || request !== this.request) return;
    if (context.state !== "running") {
      this.sequenceRequested = false;
      throw new Error("Audio could not start. Tap Play to retry.");
    }

    const playback: Playback = {
      ...this.createChannel(context),
      voices: new Set(),
      snapshot,
      once: options?.once === true,
    };
    this.playback = playback;
    const start = context.currentTime + START_LEAD_SECONDS;
    try {
      this.schedulePass(context, playback, start);
      playback.nextPassStart = start + snapshot.passSeconds;
      if (this.loopEnabled && !playback.once)
        this.armLoopTimer(playback, playback.nextPassStart);
      if (playback.voices.size === 0 && !playback.loopTimer)
        this.release(playback);
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  /**
   * Live loop latch. Read only at a pass boundary, never mid-pass: turning it
   * off lets the current pass finish; turning it on repeats from the boundary.
   */
  setLoopEnabled(enabled: boolean): void {
    this.loopEnabled = enabled;
    const playback = this.playback;
    // A one-shot playback never picks up the latch mid-flight.
    if (!playback || playback.nextPassStart === undefined || playback.once)
      return;
    if (enabled) {
      this.armLoopTimer(playback, playback.nextPassStart);
    } else if (playback.loopTimer) {
      clearTimeout(playback.loopTimer);
      playback.loopTimer = undefined;
      if (playback.voices.size === 0) this.release(playback);
    }
  }

  /** Short, monophonic edit preview. Sequence playback always takes priority. */
  async audition(sequence: SoundSequence, index: number): Promise<void> {
    if (this.disposed || this.sequenceRequested) return;
    const step = sequence.steps[index];
    if (!step) return;
    const snapshot = { ...step };
    const waveform = WAVEFORM_TYPES.includes(sequence.waveform)
      ? sequence.waveform
      : "sine";
    const tuning: VoiceTuning = {
      decayShare: ringShareFromDial(sequence.decay),
      pitchShift: validPitch(sequence.pitch),
    };
    this.masterVolume = normalizedVolume(sequence.masterVolume);
    this.panDial = normalizedVolume(sequence.pan);
    this.cutDial = normalizedVolume(sequence.cut);
    const request = ++this.previewRequest;
    clearTimeout(this.previewTimer);
    this.previewTimer = undefined;
    // Create/resume inside the pointer gesture, not inside the trailing timer.
    const context = (this.context ??= this.createContext());
    if (context.state !== "running") await context.resume();
    if (
      this.disposed ||
      this.sequenceRequested ||
      request !== this.previewRequest
    )
      return;
    if (context.state !== "running") return;
    if (
      !snapshot.enabled ||
      !Number.isFinite(snapshot.volume) ||
      snapshot.volume <= 0 ||
      this.masterVolume === 0
    ) {
      this.fade(this.preview);
      this.preview = undefined;
      return;
    }
    const start = (): void => {
      this.previewTimer = undefined;
      if (
        this.disposed ||
        this.sequenceRequested ||
        request !== this.previewRequest
      )
        return;
      this.startPreview(context, snapshot, waveform, tuning);
    };
    const delay =
      this.lastPreviewAt + PREVIEW_INTERVAL_SECONDS - context.currentTime;
    if (delay > 0) this.previewTimer = setTimeout(start, delay * 1000);
    else start();
  }

  private startPreview(
    context: AudioContext,
    step: SoundStep,
    waveform: WaveformType,
    tuning: VoiceTuning,
  ): void {
    this.fade(this.preview);
    this.preview = undefined;
    this.lastPreviewAt = context.currentTime;
    const preview: Playback = {
      ...this.createChannel(context),
      voices: new Set(),
    };
    this.preview = preview;
    try {
      const voice = scheduleVoice(
        context,
        preview.output,
        step,
        waveform,
        context.currentTime,
        PREVIEW_SECONDS,
        tuning,
      );
      preview.voices.add(voice);
      voice.addEventListener("ended", () => this.release(preview), {
        once: true,
      });
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

  /** Live stereo placement, shared by playback and edit previews, without changing steps. */
  setPan(value: number): void {
    this.panDial = normalizedVolume(value);
    if (!this.context) return; // Turning PAN alone must not unlock/create audio.
    const now = this.context.currentTime;
    for (const sound of [this.playback, this.preview]) {
      if (!sound) continue;
      const pan = sound.panner.pan;
      pan.cancelAndHoldAtTime(now);
      pan.linearRampToValueAtTime(
        panFromDial(this.panDial),
        now + STOP_FADE_SECONDS,
      );
    }
  }

  /** Live filter brightness, shared by playback and edit previews, without changing steps. */
  setCutoff(value: number): void {
    const wasOpen = this.cutDial >= 1;
    this.cutDial = normalizedVolume(value);
    if (!this.context) return; // Turning CUT alone must not unlock/create audio.
    const now = this.context.currentTime;
    for (const sound of [this.playback, this.preview]) {
      if (!sound) continue;
      // Crossing the fully open point rewires the filter in or out of the chain.
      if (wasOpen !== this.cutDial >= 1) {
        sound.output.disconnect();
        sound.filter.disconnect();
        if (this.cutDial >= 1) sound.output.connect(sound.panner);
        else sound.output.connect(sound.filter).connect(sound.panner);
      }
      const frequency = sound.filter.frequency;
      frequency.cancelAndHoldAtTime(now);
      frequency.linearRampToValueAtTime(
        cutoffFromDial(this.cutDial),
        now + STOP_FADE_SECONDS,
      );
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

  /** Release the hardware context when the owning board is destroyed. */
  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    if (this.context && this.context.state !== "closed")
      await this.context.close();
  }

  /** Schedule one 32-step pass of the Play snapshot on the audio clock. */
  private schedulePass(
    context: AudioContext,
    playback: Playback,
    start: number,
  ): void {
    const snapshot = playback.snapshot;
    if (!snapshot) return;
    snapshot.steps.forEach((step, index) => {
      if (!step.enabled || step.volume === 0) return;
      const voice = scheduleVoice(
        context,
        playback.output,
        step,
        snapshot.waveform,
        start + index * snapshot.stepSeconds,
        snapshot.stepSeconds,
        {
          decayShare: snapshot.decayShare,
          pitchShift: snapshot.pitchShift,
        },
      );
      playback.voices.add(voice);
      voice.addEventListener(
        "ended",
        () => {
          playback.voices.delete(voice);
          if (playback.voices.size === 0 && !playback.loopTimer)
            this.release(playback);
        },
        { once: true },
      );
    });
  }

  /** Arm the single pass-boundary check; at the boundary the loop latch decides. */
  private armLoopTimer(playback: Playback, nextPassStart: number): void {
    const context = this.context;
    if (!context || this.disposed || playback.loopTimer) return;
    playback.nextPassStart = nextPassStart;
    const waitMs = Math.max(
      0,
      (nextPassStart - LOOP_LOOKAHEAD_SECONDS - context.currentTime) * 1000,
    );
    playback.loopTimer = setTimeout(
      () => {
        playback.loopTimer = undefined;
        if (this.disposed || this.playback !== playback) return;
        if (context.currentTime < nextPassStart - LOOP_LOOKAHEAD_SECONDS) {
          this.armLoopTimer(playback, nextPassStart); // Woke early: keep waiting.
          return;
        }
        if (!this.loopEnabled) {
          // Toggled off mid-pass: finish this pass, then end.
          if (playback.voices.size === 0) this.release(playback);
          return;
        }
        const passSeconds = playback.snapshot?.passSeconds;
        if (passSeconds === undefined) return;
        try {
          this.schedulePass(context, playback, nextPassStart);
        } catch {
          this.stop();
          return;
        }
        this.armLoopTimer(playback, nextPassStart + passSeconds);
      },
      Math.min(waitMs, LOOP_TIMER_CAP_MS),
    );
  }

  private fade(playback?: Playback): void {
    const context = this.context;
    if (!playback || !context) return;
    clearTimeout(playback.loopTimer);
    playback.loopTimer = undefined;
    const now = context.currentTime;
    playback.output.gain.cancelAndHoldAtTime(now);
    playback.output.gain.linearRampToValueAtTime(0, now + STOP_FADE_SECONDS);
    for (const voice of playback.voices) voice.stop(now + STOP_FADE_SECONDS);
  }

  /** Channel shared by playback and previews: gain into low-pass into panner. */
  private createChannel(
    context: AudioContext,
  ): Pick<Playback, "output" | "filter" | "panner"> {
    const output = context.createGain();
    output.gain.value = this.masterVolume;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoffFromDial(this.cutDial);
    const panner = context.createStereoPanner();
    panner.pan.value = panFromDial(this.panDial);
    // Fully open CUT is a true bypass, so the default sounds exactly as before.
    if (this.cutDial >= 1) output.connect(panner);
    else output.connect(filter).connect(panner);
    panner.connect(context.destination);
    return { output, filter, panner };
  }

  private release(playback: Playback): void {
    clearTimeout(playback.loopTimer);
    playback.loopTimer = undefined;
    playback.output.disconnect();
    playback.filter.disconnect();
    playback.panner.disconnect();
    if (this.playback === playback) {
      this.playback = undefined;
      this.sequenceRequested = false;
    }
    if (this.preview === playback) this.preview = undefined;
  }
}
