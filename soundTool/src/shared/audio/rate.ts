/** Equal dial travel per doubling, with 1x at the center. */
export const PLAYBACK_RATES = [0.25, 0.5, 1, 2, 4] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export function snapRateDial(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 4) / 4;
}

export function rateFromDial(value: number): PlaybackRate {
  return PLAYBACK_RATES[Math.round(snapRateDial(value) * 4)];
}

export function rateToDial(rate: number): number {
  return PLAYBACK_RATES.indexOf(validRate(rate)) / 4;
}

export function validRate(rate: number): PlaybackRate {
  return PLAYBACK_RATES.includes(rate as PlaybackRate)
    ? (rate as PlaybackRate)
    : 1;
}
