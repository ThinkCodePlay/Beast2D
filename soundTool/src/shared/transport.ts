/**
 * What the transport buttons and live dials do. The composition root
 * (src/2d/main.ts, src/3d/main.ts) owns the SoundPlayer behind these
 * callbacks; rendering components only call them.
 */
export interface TransportActions {
  /** Start a pass of the current sequence (snapshot semantics: later edits wait for the next Play). */
  play(): void;
  /** Play the current sequence exactly once, whatever the loop latch says; the latch is unchanged. */
  playOnce(): void;
  /** Fade out playback and previews. */
  stop(): void;
  /** Play a short preview of one edited step. */
  audition(index: number): void;
  /** Live master gain, 0..1. */
  setMasterVolume(value: number): void;
  /** Live stereo placement dial, 0 left .. 0.5 center .. 1 right. */
  setPan(value: number): void;
  /** Live low-pass filter dial, 1 fully open (bypassed). */
  setCutoff(value: number): void;
  /** Flips the loop latch; returns the new state so the button can show it. */
  toggleLoop(): boolean;
  /** Current loop latch, so the loop button can show a restored state. */
  isLooping(): boolean;
}
