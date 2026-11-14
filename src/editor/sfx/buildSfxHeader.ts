import { CHIP_IDS, CHIP_LABELS, CHIPS, type LiveChipId } from "../../core/sfx/chips";
import { el, pressable } from "./buildDom";

export type SfxHeaderUi = {
  top: HTMLElement;
  transport: HTMLElement;
  playButton: HTMLButtonElement;
  playIcon: HTMLCanvasElement;
  stopButton: HTMLButtonElement;
  stopIcon: HTMLCanvasElement;
  loopButton: HTMLButtonElement;
  loopIcon: HTMLCanvasElement;
  nameInput: HTMLInputElement;
  rotor: HTMLElement;
  rotorCanvas: HTMLCanvasElement;
  chipButtons: Map<string, HTMLElement>;
  onRotorPick: (chip: LiveChipId) => void;
};

export function buildSfxHeader(onRotorPick: (chip: LiveChipId) => void): SfxHeaderUi {
  const top = el("div", "beast2d-sfx-top");
  const transport = el("div", "beast2d-sfx-transport");
  const playButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn") as HTMLButtonElement;
  playButton.type = "button";
  playButton.title = "Play";
  const playIcon = el("canvas", "beast2d-sfx-btn-icon") as HTMLCanvasElement;
  playButton.append(playIcon);
  const stopButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn") as HTMLButtonElement;
  stopButton.type = "button";
  stopButton.title = "Stop";
  const stopIcon = el("canvas", "beast2d-sfx-btn-icon") as HTMLCanvasElement;
  stopButton.append(stopIcon);
  const loopButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn") as HTMLButtonElement;
  loopButton.type = "button";
  loopButton.title = "Loop";
  const loopIcon = el("canvas", "beast2d-sfx-btn-icon") as HTMLCanvasElement;
  loopButton.append(loopIcon);
  pressable(playButton);
  pressable(stopButton);
  pressable(loopButton);
  transport.append(playButton, stopButton, loopButton);

  const nameLcd = el("div", "beast2d-sfx-name-lcd");
  const nameInput = el("input", "beast2d-sfx-name") as HTMLInputElement;
  nameInput.type = "text";
  nameInput.maxLength = 16;
  nameInput.spellcheck = false;
  nameInput.autocomplete = "off";
  nameInput.setAttribute("aria-label", "SFX name");
  nameLcd.append(nameInput);

  const rotor = el("div", "beast2d-sfx-rotor");
  const rotorCanvas = el("canvas", "beast2d-sfx-rotor-canvas") as HTMLCanvasElement;
  rotor.append(rotorCanvas);
  const chipButtons = new Map<string, HTMLElement>();
  for (const id of CHIP_IDS) {
    const live = CHIPS[id].live;
    const chip = live
      ? (el("button", `beast2d-sfx-chip beast2d-sfx-chip-${id}`) as HTMLButtonElement)
      : el("span", `beast2d-sfx-chip beast2d-sfx-chip-${id} is-dim`);
    chip.setAttribute("aria-label", CHIP_LABELS[id]);
    if (chip instanceof HTMLButtonElement) {
      chip.type = "button";
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        onRotorPick(id as LiveChipId);
      });
    }
    chipButtons.set(id, chip);
    rotor.append(chip);
  }
  rotor.addEventListener("click", (event) => {
    const rect = rotor.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const live =
      x < rect.width / 2 && y < rect.height / 2 ? "pico"
      : x < rect.width / 2 && y >= rect.height / 2 ? "gb"
      : x >= rect.width / 2 && y < rect.height / 2 ? "snes"
      : "gen";
    if (!CHIPS[live].live) return;
    onRotorPick(live as LiveChipId);
  });
  top.append(transport, nameLcd, rotor);

  return {
    top,
    transport,
    playButton,
    playIcon,
    stopButton,
    stopIcon,
    loopButton,
    loopIcon,
    nameInput,
    rotor,
    rotorCanvas,
    chipButtons,
    onRotorPick,
  };
}