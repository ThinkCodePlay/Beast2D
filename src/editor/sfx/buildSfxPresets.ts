import { PRESET_IDS, type PresetId } from "../../core/sfx/generate";
import { el, pressable } from "./buildDom";

export type SfxPresetsUi = {
  presets: HTMLElement;
  presetButtons: Map<string, HTMLButtonElement>;
  diceButton: HTMLButtonElement;
  onPreset: (preset: PresetId) => void;
  onDice: () => void;
};

export function buildSfxPresets(
  onPreset: (preset: PresetId) => void,
  onDice: () => void,
): SfxPresetsUi {
  const presets = el("div", "beast2d-sfx-presets");
  const presetButtons = new Map<string, HTMLButtonElement>();
  for (const preset of PRESET_IDS) {
    const button = el(
      "button",
      "beast2d-sfx-btn beast2d-sfx-preset",
    ) as HTMLButtonElement;
    button.type = "button";
    button.title = preset.toUpperCase();
    const label = el("span", "beast2d-sfx-preset-name", preset.toUpperCase());
    button.append(label);
    pressable(button);
    button.addEventListener("click", () => onPreset(preset));
    presetButtons.set(preset, button);
    presets.append(button);
  }
  const diceButton = el(
    "button",
    "beast2d-sfx-btn beast2d-sfx-preset",
  ) as HTMLButtonElement;
  diceButton.type = "button";
  diceButton.title = "Dice";
  const diceLabel = el("span", "beast2d-sfx-preset-name", "DICE");
  diceButton.append(diceLabel);
  pressable(diceButton);
  diceButton.addEventListener("click", onDice);
  presets.append(diceButton);

  return {
    presets,
    presetButtons,
    diceButton,
    onPreset,
    onDice,
  };
}
