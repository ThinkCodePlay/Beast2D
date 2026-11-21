/** What the transport buttons do; the composition root owns the player behind them. */
export interface TransportActions {
  play(): void;
  stop(): void;
  audition(index: number): void;
}
