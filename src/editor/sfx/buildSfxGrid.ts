import { SFX_STEPS, WAVE_IDS, type WaveId } from "../../core/sfx/chips";
import { PITCH_MAX, VOLUME_MAX, clampPitch, clampVolume } from "../../core/sfx/grid";
import { updateSfxSlot } from "../../core/sfx/bank";
import { el, pressable } from "./buildDom";

export type SfxGridUi = {
  gridWrap: HTMLElement;
  pitchRow: HTMLElement;
  volumeRow: HTMLElement;
  playhead: HTMLElement;
  pitchBars: HTMLElement[];
  volumeSteps: HTMLElement[][];
  waveButtons: Map<WaveId, HTMLButtonElement>;
  mid: HTMLElement;
  waves: HTMLElement;
  sequencer: HTMLElement;
  sparePad: HTMLElement;
  bindInput: (getSelected: () => number, clearArmed: () => void) => void;
};

export function buildSfxGrid(
  effects: HTMLElement,
  onWave: (wave: WaveId) => void,
): SfxGridUi {
  const mid = el("div", "beast2d-sfx-mid");
  const gridWrap = el("div", "beast2d-sfx-grid");
  const pitchRow = el("div", "beast2d-sfx-pitch");
  const volumeRow = el("div", "beast2d-sfx-volume");
  const pitchBars: HTMLElement[] = [];
  const volumeSteps: HTMLElement[][] = [];
  for (let index = 0; index < SFX_STEPS; index += 1) {
    const pitchCell = el("div", "beast2d-sfx-cell");
    const pitchBar = el("div", "beast2d-sfx-bar");
    pitchCell.append(pitchBar);
    pitchRow.append(pitchCell);
    pitchBars.push(pitchBar);

    const volumeCell = el("div", "beast2d-sfx-cell beast2d-sfx-vol-cell");
    const stack = el("div", "beast2d-sfx-vol-stack");
    const steps: HTMLElement[] = [];
    for (let step = 0; step < VOLUME_MAX + 1; step += 1) {
      const block = el("div", "beast2d-sfx-vol-step");
      stack.append(block);
      steps.push(block);
    }
    volumeCell.append(stack);
    volumeRow.append(volumeCell);
    volumeSteps.push(steps);
  }
  const playhead = el("div", "beast2d-sfx-playhead");
  gridWrap.append(pitchRow, volumeRow, playhead);

  const waves = el("div", "beast2d-sfx-waves");
  const waveButtons = new Map<WaveId, HTMLButtonElement>();
  for (const id of WAVE_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-wave") as HTMLButtonElement;
    button.type = "button";
    button.title = id.toUpperCase();
    const icon = el("canvas", "beast2d-sfx-wave-icon") as HTMLCanvasElement;
    button.append(icon);
    pressable(button);
    button.addEventListener("click", () => onWave(id));
    waveButtons.set(id, button);
    waves.append(button);
  }

  mid.append(gridWrap, waves);
  const sequencer = el("div", "beast2d-sfx-sequencer");
  const sparePad = el("div", "beast2d-sfx-spare");
  sparePad.setAttribute("aria-hidden", "true");
  sequencer.append(mid, effects, sparePad);

  function bindDraw(target: HTMLElement, kind: "pitch" | "volume", getSelected: () => number, clearArmed: () => void): void {
    const draw = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const col = Math.min(SFX_STEPS - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * SFX_STEPS)));
      const amount = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
      clearArmed();
      updateSfxSlot(getSelected(), (slot) => {
        if (kind === "pitch") {
          slot.pitch[col] = clampPitch(Math.round(amount * PITCH_MAX));
        } else {
          slot.volume[col] = clampVolume(Math.round(amount * VOLUME_MAX));
        }
      });
    };
    target.addEventListener("pointerdown", (event) => {
      target.setPointerCapture(event.pointerId);
      draw(event);
    });
    target.addEventListener("pointermove", (event) => {
      if (!target.hasPointerCapture(event.pointerId)) return;
      draw(event);
    });
  }

  function bindInput(getSelected: () => number, clearArmed: () => void): void {
    bindDraw(pitchRow, "pitch", getSelected, clearArmed);
    bindDraw(volumeRow, "volume", getSelected, clearArmed);
  }

  return {
    gridWrap,
    pitchRow,
    volumeRow,
    playhead,
    pitchBars,
    volumeSteps,
    waveButtons,
    mid,
    waves,
    sequencer,
    sparePad,
    bindInput,
  };
}