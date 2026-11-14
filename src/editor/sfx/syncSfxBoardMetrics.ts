import { PRESET_SPRITE_H, PRESET_SPRITE_W } from "./presetSprites";
import { KNOB_SPRITE_H, KNOB_SPRITE_W } from "./knobSprites";
import { TRANSPORT_SPRITE_H, TRANSPORT_SPRITE_W } from "./transportSprites";
import { WAVE_SPRITE_H, WAVE_SPRITE_W } from "./waveSprites";

/** Largest integer scale so `native * scale * chrome ≤ limit` (pixel-snapped). */
function fitIntegerScale(native: number, chrome: number, limitPx: number): number {
  if (native <= 0 || chrome <= 0 || limitPx <= 0) return 1;
  const unit = native * chrome;
  const scale = Math.floor(limitPx / unit);
  return Math.max(1, scale);
}

/**
 * Key size from board width: 8 knob cells + 7 gaps (widest row).
 * Capped at preset 2× (64×56 design px × chrome). Sets `--sfx-key-w/h`, knob caps.
 */
export function syncSfxBoardMetrics(machine: HTMLElement): void {
  const chrome =
    Number.parseInt(getComputedStyle(machine).getPropertyValue("--beast-scale"), 10) ||
    Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--beast-scale"), 10) ||
    1;

  const gap = 4 * chrome;
  const innerW = machine.clientWidth;
  const cellW = Math.floor((innerW - 7 * gap) / 8);

  const capW = PRESET_SPRITE_W * 2 * chrome;
  const capH = PRESET_SPRITE_H * 2 * chrome;
  let keyW = Math.min(cellW, capW);
  let keyH = Math.round((keyW * PRESET_SPRITE_H) / PRESET_SPRITE_W);
  if (keyH > capH) {
    keyH = capH;
    keyW = Math.round((keyH * PRESET_SPRITE_W) / PRESET_SPRITE_H);
  }
  keyW = Math.max(1, keyW);
  keyH = Math.max(1, keyH);

  const modPad = 2 * chrome;
  const knobLimitW = Math.max(1, keyW - modPad * 2);
  const knobLimitH = Math.max(1, keyH - modPad - 10 * chrome);
  const knobScale = Math.min(
    fitIntegerScale(KNOB_SPRITE_W, chrome, knobLimitW),
    fitIntegerScale(KNOB_SPRITE_H, chrome, knobLimitH),
    2,
  );

  const transportScale = Math.min(
    fitIntegerScale(TRANSPORT_SPRITE_W, chrome, keyW),
    fitIntegerScale(TRANSPORT_SPRITE_H, chrome, keyH),
    2,
  );

  const waveScale = Math.min(
    fitIntegerScale(WAVE_SPRITE_W, chrome, keyW),
    fitIntegerScale(WAVE_SPRITE_H, chrome, keyH),
    2,
  );

  machine.style.setProperty("--sfx-key-w", `${keyW}px`);
  machine.style.setProperty("--sfx-key-h", `${keyH}px`);
  machine.style.setProperty("--sfx-knob-w", `${KNOB_SPRITE_W * knobScale * chrome}px`);
  machine.style.setProperty("--sfx-knob-h", `${KNOB_SPRITE_H * knobScale * chrome}px`);
  machine.style.setProperty("--sfx-transport-w", `${TRANSPORT_SPRITE_W * transportScale * chrome}px`);
  machine.style.setProperty("--sfx-transport-h", `${TRANSPORT_SPRITE_H * transportScale * chrome}px`);
  machine.style.setProperty("--sfx-wave-sprite-w", `${WAVE_SPRITE_W * waveScale * chrome}px`);
  machine.style.setProperty("--sfx-wave-sprite-h", `${WAVE_SPRITE_H * waveScale * chrome}px`);
}