import { Beast2D16 } from "../palette/beast2d16";

export type PixelParticle = {
  dx: number;
  dy: number;
  color: number;
};

export type PixelBurstPreset = {
  durationFrames: number;
  particles: PixelParticle[];
};

export const MUZZLE_FLASH: PixelBurstPreset = {
  durationFrames: 3,
  particles: [
    { dx: 0, dy: -4, color: Beast2D16.Yellow },
    { dx: -2, dy: -3, color: Beast2D16.Orange },
    { dx: 2, dy: -3, color: Beast2D16.Orange },
    { dx: 0, dy: -2, color: Beast2D16.Cream },
  ],
};

export const EXPLOSION_SMALL: PixelBurstPreset = {
  durationFrames: 12,
  particles: [
    { dx: 0, dy: 0, color: Beast2D16.Yellow },
    { dx: -4, dy: -2, color: Beast2D16.Orange },
    { dx: 4, dy: -2, color: Beast2D16.Orange },
    { dx: -3, dy: 2, color: Beast2D16.Red },
    { dx: 3, dy: 2, color: Beast2D16.Red },
    { dx: 0, dy: 4, color: Beast2D16.DeepRose },
    { dx: -5, dy: 0, color: Beast2D16.Orange },
    { dx: 5, dy: 0, color: Beast2D16.Orange },
  ],
};

export const EXHAUST_PUFF: PixelBurstPreset = {
  durationFrames: 8,
  particles: [
    { dx: 0, dy: 2, color: Beast2D16.SkyBlue },
    { dx: -2, dy: 3, color: Beast2D16.Blue },
    { dx: 2, dy: 3, color: Beast2D16.Blue },
  ],
};
