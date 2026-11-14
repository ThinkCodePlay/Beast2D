import { PRESET_IDS, type PresetId } from "../../core/sfx/generate";
import { el, pressable } from "./buildDom";

export type SfxPresetsUi = {
  presets: HTMLElement;
  presetChipBadge: HTMLElement;
  presetButtons: Map<string, HTMLButtonElement>;
  presetIcons: Map<string, HTMLCanvasElement>;
  diceButton: HTMLButtonElement;
  diceIcon: HTMLCanvasElement;
  onPreset: (preset: PresetId) => void;
  onDice: () => void;
};

export function buildSfxPresets(onPreset: (preset: PresetId) => void, onDice: () => void): SfxPresetsUi {
  const presets = el("div", "beast2d-sfx-presets");
  const presetChipBadge = el("span", "beast2d-sfx-row-badge beast2d-sfx-preset-strip-chip", "GB");
  const presetButtons = new Map<string, HTMLButtonElement>();
  const presetIcons = new Map<string, HTMLCanvasElement>();
  presets.append(presetChipBadge);
  for (const preset of PRESET_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset") as HTMLButtonElement;
    button.type = "button";
    button.title = preset.toUpperCase();
    const icon = el("canvas", "beast2d-sfx-btn-icon") as HTMLCanvasElement;
    const label = el("span", "beast2d-sfx-preset-name", preset.toUpperCase());
    button.append(icon, label);
    presetIcons.set(preset, icon);
    pressable(button);
    button.addEventListener("click", () => onPreset(preset));
    presetButtons.set(preset, button);
    presets.append(button);
  }
  const diceButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset") as HTMLButtonElement;
  diceButton.type = "button";
  diceButton.title = "Dice";
  const diceIcon = el("canvas", "beast2d-sfx-btn-icon") as HTMLCanvasElement;
  const diceLabel = el("span", "beast2d-sfx-preset-name", "DICE");
  diceButton.append(diceIcon, diceLabel);
  pressable(diceButton);
  diceButton.addEventListener("click", onDice);
  presets.append(diceButton);

  return {
    presets,
    presetChipBadge,
    presetButtons,
    presetIcons,
    diceButton,
    diceIcon,
    onPreset,
    onDice,
  };
}