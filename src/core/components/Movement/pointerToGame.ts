/**
 * Maps a viewport `clientX`/`clientY` to logical game space inside a canvas
 * that may be integer-scaled via CSS (see displayScale.ts).
 */
export function pointerToGame(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  gameWidth: number,
  gameHeight: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  const x = ((clientX - rect.left) / rect.width) * gameWidth;
  const y = ((clientY - rect.top) / rect.height) * gameHeight;
  return { x, y };
}
