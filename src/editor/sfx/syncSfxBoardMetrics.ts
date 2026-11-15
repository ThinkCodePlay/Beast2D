import { CHIP_IDS, CHIP_LABELS } from "../../core/sfx/chips";
import { PRESET_SPRITE_H, PRESET_SPRITE_W } from "./presetSprites";
import { KNOB_SPRITE_H, KNOB_SPRITE_W } from "./knobSprites";

/** Largest integer scale so `native * scale * chrome ≤ limit` (pixel-snapped). */
function fitIntegerScale(native: number, chrome: number, limitPx: number): number {
  if (native <= 0 || chrome <= 0 || limitPx <= 0) return 1;
  const unit = native * chrome;
  const scale = Math.floor(limitPx / unit);
  return Math.max(1, scale);
}

let rotorGutterMeasure: HTMLCanvasElement | null = null;

function longestChipLabelPx(chrome: number): number {
  const fontPx = 8 * chrome;
  let textW = 0;
  for (const id of CHIP_IDS) {
    textW = Math.max(textW, CHIP_LABELS[id].length * fontPx * 0.62);
  }
  if (typeof document !== "undefined" && "fonts" in document) {
    rotorGutterMeasure ??= document.createElement("canvas");
    const ctx = rotorGutterMeasure.getContext("2d");
    if (ctx) {
      ctx.font = `${fontPx}px "Monogram", ui-monospace, monospace`;
      for (const id of CHIP_IDS) {
        textW = Math.max(textW, ctx.measureText(CHIP_LABELS[id]).width);
      }
    }
  }
  return Math.ceil(textW);
}

/**
 * One integer key scale for every 32×28 key row. Knobs use matching integer 16×16 scale.
 */
export function syncSfxBoardMetrics(machine: HTMLElement): void {
  const chrome =
    Number.parseInt(getComputedStyle(machine).getPropertyValue("--beast-scale"), 10) ||
    Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--beast-scale"), 10) ||
    1;

  const keyGap = 4 * chrome;
  const innerW = machine.clientWidth;

  const rowScale = (count: number) => {
    const gaps = (count - 1) * keyGap;
    const perKey = Math.floor((innerW - gaps) / count);
    return Math.min(
      fitIntegerScale(PRESET_SPRITE_W, chrome, perKey),
      fitIntegerScale(PRESET_SPRITE_H, chrome, perKey),
    );
  };

  const maxKeyScale = 2;
  const keyScale = Math.min(rowScale(6), rowScale(7), rowScale(8), maxKeyScale);

  const keyW = PRESET_SPRITE_W * keyScale * chrome;
  const keyH = PRESET_SPRITE_H * keyScale * chrome;

  const labelPx = longestChipLabelPx(chrome);
  const sidePad = Math.max(chrome, Math.ceil(labelPx * 0.15));
  const rotorW = keyW + sidePad * 2;

  const transportW = 3 * keyW + 2 * keyGap;
  const topGaps = 2 * keyGap;
  const lcdMin = 24 * chrome;
  const lcdMax = Math.max(lcdMin, innerW - transportW - rotorW - topGaps);

  const cellW = Math.floor((innerW - 7 * keyGap) / 8);
  const modPad = 1 * chrome;
  const labelBand = 9 * chrome;
  const knobAvailW = Math.max(1, cellW - modPad * 2);
  const knobAvailH = Math.max(1, keyH);
  const knobScale = Math.min(
    keyScale,
    fitIntegerScale(KNOB_SPRITE_W, chrome, knobAvailW),
    fitIntegerScale(KNOB_SPRITE_H, chrome, knobAvailH),
    2,
  );
  const knobPx = KNOB_SPRITE_W * knobScale * chrome;

  machine.style.setProperty("--sfx-key-scale", String(keyScale));
  machine.style.setProperty("--sfx-key-w", `${keyW}px`);
  machine.style.setProperty("--sfx-key-h", `${keyH}px`);
  machine.style.setProperty("--sfx-rotor-w", `${rotorW}px`);
  machine.style.setProperty("--sfx-lcd-max-w", `${lcdMax}px`);
  machine.style.setProperty("--sfx-knob-scale", String(knobScale));
  machine.style.setProperty("--sfx-knob-w", `${knobPx}px`);
  machine.style.setProperty("--sfx-knob-h", `${knobPx}px`);
  machine.style.setProperty("--sfx-fx-mod-h", `${keyH + labelBand}px`);
}