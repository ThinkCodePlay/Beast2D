/** What the transport buttons do; the composition root owns the player behind them. */
export interface TransportActions {
  play(): void;
  stop(): void;
  audition(index: number): void;
  setMasterVolume(value: number): void;
  setPan(value: number): void;
  setCutoff(value: number): void;
  /** Flips the loop latch; returns the new state so the button can show it. */
  toggleLoop(): boolean;
}
