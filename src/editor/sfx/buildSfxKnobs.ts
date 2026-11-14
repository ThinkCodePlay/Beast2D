import { KNOB_IDS, type KnobId } from "../../core/sfx/chips";
import { clampKnob } from "../../core/sfx/grid";
import { updateSfxSlot } from "../../core/sfx/bank";
import { knobLabel } from "../sfxKnobLabels";
import { el, knobStepFromPointer } from "./buildDom";

export type KnobUi = {
  button: HTMLButtonElement;
  canvas: HTMLCanvasElement;
  label: HTMLElement;
  module: HTMLElement;
  tag: HTMLElement | null;
};

export type SfxKnobsUi = {
  effects: HTMLElement;
  knobUi: Map<KnobId, KnobUi>;
  bindKnobs: (getSelected: () => number, clearArmed: () => void) => void;
};

export function buildSfxKnobs(): SfxKnobsUi {
  const effects = el("div", "beast2d-sfx-effects");
  const knobUi = new Map<KnobId, KnobUi>();
  for (const id of KNOB_IDS) {
    const box = el("section", "beast2d-sfx-fx-mod");
    box.dataset.knob = id;
    const tag = id === "cutoff" ? el("span", "beast2d-sfx-fx-mod-tag", "") : null;
    if (tag) tag.hidden = true;
    const button = el("button", "beast2d-sfx-knob") as HTMLButtonElement;
    button.type = "button";
    button.setAttribute("aria-label", knobLabel(id));
    const knobCanvas = el("canvas", "beast2d-sfx-knob-icon") as HTMLCanvasElement;
    const label = el("span", "beast2d-sfx-knob-label", knobLabel(id));
    button.append(knobCanvas);
    if (tag) box.append(tag);
    box.append(button, label);
    knobUi.set(id, { button, canvas: knobCanvas, label, module: box, tag });
    effects.append(box);
  }

  function bindKnobs(getSelected: () => number, clearArmed: () => void): void {
    for (const id of KNOB_IDS) {
      const ui = knobUi.get(id);
      if (!ui) continue;
      const button = ui.button;
      const apply = (clientX: number, clientY: number) => {
        const next = knobStepFromPointer(button, clientX, clientY);
        if (next === null) return;
        clearArmed();
        updateSfxSlot(getSelected(), (slot) => {
          slot.knobs[id] = clampKnob(next);
        });
      };
      button.addEventListener("pointerdown", (event) => {
        if (button.disabled) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        button.classList.add("is-down");
        apply(event.clientX, event.clientY);
      });
      button.addEventListener("pointermove", (event) => {
        if (!button.hasPointerCapture(event.pointerId)) return;
        apply(event.clientX, event.clientY);
      });
      const release = (event: PointerEvent) => {
        if (!button.hasPointerCapture(event.pointerId)) return;
        button.releasePointerCapture(event.pointerId);
        button.classList.remove("is-down");
      };
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
    }
  }

  return { effects, knobUi, bindKnobs };
}