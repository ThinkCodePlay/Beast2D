import { BOARD_WIDTH, BOARD_HEIGHT } from '../SoundBoardFrame';

export { BOARD_WIDTH, BOARD_HEIGHT };

/** Design depth of the cabinet body, in board pixels. */
export const CABINET_DEPTH = 16;

/**
 * Convert a board-design point (origin top-left, y grows down) to the 3D
 * scene's world space (origin at the board's center, y grows up). One world
 * unit is one board pixel, so every pixel-scaled size stays valid.
 */
export function boardToWorld(x: number, y: number): { x: number; y: number } {
  return { x: x - BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 - y };
}
