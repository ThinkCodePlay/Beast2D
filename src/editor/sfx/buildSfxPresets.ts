import { PRESET_IDS, type PresetId } from "../../core/sfx/generate";
import { presetSpriteUrl, type PresetSpriteId } from "./presetSprites";
import { el, pressable } from "./buildDom";

export type SfxPresetsUi = {
  presets: HTMLElement;
  presetChipBadge: HTMLElement;
  presetButtons: Map<string, HTMLButtonElement>;
  presetSprites: Map<string, HTMLImageElement>;
  diceButton: HTMLButtonElement;
  onPreset: (preset: PresetId) => void;
  onDice: () => void;
};

function spriteImg(id: PresetSpriteId): HTMLImageElement {
  const img = el("img", "beast2d-sfx-preset-sprite") as HTMLImageElement;
  img.src = presetSpriteUrl(id);
  img.width = 32;
  img.height = 28;
  img.alt = "";
  img.draggable = false;
  return img;
}

export function buildSfxPresets(onPreset: (preset: PresetId) => void, onDice: () => void): SfxPresetsUi {
  const presets = el("div", "beast2d-sfx-presets");
  const presetChipBadge = el("span", "beast2d-sfx-row-badge beast2d-sfx-preset-strip-chip", "GB");
  const presetButtons = new Map<string, HTMLButtonElement>();
  const presetSprites = new Map<string, HTMLImageElement>();
  presets.append(presetChipBadge);
  for (const preset of PRESET_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset") as HTMLButtonElement;
    button.type = "button";
    button.title = preset.toUpperCase();
    const img = spriteImg(preset);
    const label = el("span", "beast2d-sfx-preset-name", preset.toUpperCase());
    button.append(img, label);
    presetSprites.set(preset, img);
    pressable(button);
    button.addEventListener("click", () => onPreset(preset));
    presetButtons.set(preset, button);
    presets.append(button);
  }
  const diceButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset") as HTMLButtonElement;
  diceButton.type = "button";
  diceButton.title = "Dice";
  const diceImg = spriteImg("dice");
  const diceLabel = el("span", "beast2d-sfx-preset-name", "DICE");
  diceButton.append(diceImg, diceLabel);
  pressable(diceButton);
  diceButton.addEventListener("click", onDice);
  presets.append(diceButton);

  return {
    presets,
    presetChipBadge,
    presetButtons,
    presetSprites,
    diceButton,
    onPreset,
    onDice,
  };
}