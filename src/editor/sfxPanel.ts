import {
  CHIP_IDS,
  CHIP_LABELS,
  CHIPS,
  KNOB_IDS,
  SFX_SLOTS,
  WAVE_IDS,
  applyChip,
  effectiveChip,
  type KnobId,
  type LiveChipId,
  type SfxSound,
  type WaveId,
} from "../core/sfx/chips";
import { getSfxBank, subscribeSfxBank, updateSfxCartChip, updateSfxSlot } from "../core/sfx/bank";
import { knobLabel } from "../core/sfx/format";
import { PRESET_IDS, generateDice, generatePreset, type PresetId } from "../core/sfx/generate";
import { playSfx, sfxPlayhead, stopSfx } from "../core/sfx/synth";
import { paintSfxButton, paintSfxPresetIcon } from "./sfxButtonArt";
import { paintSfxKnob } from "./sfxKnobArt";
import { paintSfxRotor } from "./sfxRotorArt";
import { paintSfxWaveIcon } from "./sfxWaves";

export type SfxDisk = {
  machine: HTMLElement;
  bank: HTMLElement;
  setLive: (on: boolean) => void;
  handleKey: (event: KeyboardEvent) => boolean;
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function pressable(button: HTMLButtonElement): void {
  button.addEventListener("pointerdown", () => {
    if (button.disabled) return;
    button.classList.add("is-down");
  });
  const clear = () => button.classList.remove("is-down");
  button.addEventListener("pointerup", clear);
  button.addEventListener("pointerleave", clear);
}

/** Matches `paint()` needle: `rotate(-140 + value * 280deg)` with 12 o'clock = 0.5. */
const KNOB_ANGLE_MIN = -140;
const KNOB_ANGLE_MAX = 140;
const KNOB_ANGLE_SPAN = KNOB_ANGLE_MAX - KNOB_ANGLE_MIN;

function knobValueFromPointer(button: HTMLElement, clientX: number, clientY: number): number | null {
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  if (dx === 0 && dy === 0) return null;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  deg = Math.min(KNOB_ANGLE_MAX, Math.max(KNOB_ANGLE_MIN, deg));
  return (deg - KNOB_ANGLE_MIN) / KNOB_ANGLE_SPAN;
}

export function mountSfxDisk(): SfxDisk {
  let selected = 3;
  let armed: string | null = null;
  let nameSlot = -1;
  const seeds = new Map<string, number>();

  const machine = el("section", "beast2d-sfx");
  machine.setAttribute("aria-label", "SFX");

  const top = el("div", "beast2d-sfx-top");
  const transport = el("div", "beast2d-sfx-transport");
  const playButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn");
  playButton.type = "button";
  playButton.title = "Play";
  const playIcon = el("canvas", "beast2d-sfx-btn-icon");
  playButton.append(playIcon);
  const stopButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn");
  stopButton.type = "button";
  stopButton.title = "Stop";
  const stopIcon = el("canvas", "beast2d-sfx-btn-icon");
  stopButton.append(stopIcon);
  const loopButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn");
  loopButton.type = "button";
  loopButton.title = "Loop";
  const loopIcon = el("canvas", "beast2d-sfx-btn-icon");
  loopButton.append(loopIcon);
  pressable(playButton);
  pressable(stopButton);
  pressable(loopButton);
  transport.append(playButton, stopButton, loopButton);

  const nameLcd = el("div", "beast2d-sfx-name-lcd");
  const nameInput = el("input", "beast2d-sfx-name");
  nameInput.type = "text";
  nameInput.maxLength = 16;
  nameInput.spellcheck = false;
  nameInput.autocomplete = "off";
  nameInput.setAttribute("aria-label", "SFX name");
  nameLcd.append(nameInput);

  const rotor = el("div", "beast2d-sfx-rotor");
  const rotorCanvas = el("canvas", "beast2d-sfx-rotor-canvas");
  rotor.append(rotorCanvas);
  const chipButtons = new Map<string, HTMLElement>();
  for (const id of CHIP_IDS) {
    const live = CHIPS[id].live;
    const chip = live
      ? el("button", `beast2d-sfx-chip beast2d-sfx-chip-${id}`)
      : el("span", `beast2d-sfx-chip beast2d-sfx-chip-${id} is-dim`);
    chip.setAttribute("aria-label", CHIP_LABELS[id]);
    if (chip instanceof HTMLButtonElement) {
      chip.type = "button";
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        setChip(id as LiveChipId);
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
    setChip(live as LiveChipId);
  });
  top.append(transport, nameLcd, rotor);

  const presets = el("div", "beast2d-sfx-presets");
  const presetChipBadge = el("span", "beast2d-sfx-row-badge beast2d-sfx-preset-strip-chip", "GB");
  const presetButtons = new Map<string, HTMLButtonElement>();
  const presetIcons = new Map<string, HTMLCanvasElement>();
  presets.append(presetChipBadge);
  for (const preset of PRESET_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset");
    button.type = "button";
    button.title = preset.toUpperCase();
    const icon = el("canvas", "beast2d-sfx-btn-icon");
    const label = el("span", "beast2d-sfx-preset-name", preset.toUpperCase());
    button.append(icon, label);
    presetIcons.set(preset, icon);
    pressable(button);
    button.addEventListener("click", () => applyPreset(preset));
    presetButtons.set(preset, button);
    presets.append(button);
  }
  const diceButton = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-preset");
  diceButton.type = "button";
  diceButton.title = "Dice";
  const diceIcon = el("canvas", "beast2d-sfx-btn-icon");
  const diceLabel = el("span", "beast2d-sfx-preset-name", "DICE");
  diceButton.append(diceIcon, diceLabel);
  pressable(diceButton);
  diceButton.addEventListener("click", () => rollDice());
  presets.append(diceButton);

  const mid = el("div", "beast2d-sfx-mid");
  const gridWrap = el("div", "beast2d-sfx-grid");
  const pitchRow = el("div", "beast2d-sfx-pitch");
  const volumeRow = el("div", "beast2d-sfx-volume");
  const pitchBars: HTMLElement[] = [];
  const volumeBars: HTMLElement[] = [];
  for (let index = 0; index < 32; index += 1) {
    const pitchCell = el("div", "beast2d-sfx-cell");
    const pitchBar = el("div", "beast2d-sfx-bar");
    pitchCell.append(pitchBar);
    pitchRow.append(pitchCell);
    pitchBars.push(pitchBar);
    const volumeCell = el("div", "beast2d-sfx-cell");
    const volumeBar = el("div", "beast2d-sfx-bar beast2d-sfx-bar-vol");
    volumeCell.append(volumeBar);
    volumeRow.append(volumeCell);
    volumeBars.push(volumeBar);
  }
  const playhead = el("div", "beast2d-sfx-playhead");
  gridWrap.append(pitchRow, volumeRow, playhead);

  const waves = el("div", "beast2d-sfx-waves");
  const waveButtons = new Map<WaveId, HTMLButtonElement>();
  for (const id of WAVE_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-pixel-btn beast2d-sfx-wave");
    button.type = "button";
    button.title = id.toUpperCase();
    const icon = el("canvas", "beast2d-sfx-wave-icon");
    button.append(icon);
    pressable(button);
    button.addEventListener("click", () => {
      armed = null;
      updateSfxSlot(selected, (sound) => {
        sound.wave = id;
      });
    });
    waveButtons.set(id, button);
    waves.append(button);
  }
  const effects = el("div", "beast2d-sfx-effects");
  const knobUi = new Map<
    KnobId,
  { button: HTMLButtonElement; canvas: HTMLCanvasElement; label: HTMLElement; module: HTMLElement; tag: HTMLElement | null }
  >();
  for (const id of KNOB_IDS) {
    const box = el("section", "beast2d-sfx-fx-mod");
    box.dataset.knob = id;
    const tag =
      id === "cutoff" ? el("span", "beast2d-sfx-fx-mod-tag", "") : null;
    if (tag) tag.hidden = true;
    const button = el("button", "beast2d-sfx-knob");
    button.type = "button";
    button.setAttribute("aria-label", knobLabel(id));
    const knobCanvas = el("canvas", "beast2d-sfx-knob-icon");
    const label = el("span", "beast2d-sfx-knob-label", knobLabel(id));
    button.append(knobCanvas);
    if (tag) box.append(tag);
    box.append(button, label);
    knobUi.set(id, { button, canvas: knobCanvas, label, module: box, tag });
    bindKnob(id, button);
    effects.append(box);
  }
  mid.append(gridWrap, waves);
  const sequencer = el("div", "beast2d-sfx-sequencer");
  const sparePad = el("div", "beast2d-sfx-spare");
  sparePad.setAttribute("aria-hidden", "true");
  sequencer.append(mid, effects, sparePad);

  machine.append(top, presets, sequencer);

  const bank = el("section", "beast2d-sfx-bank");
  bank.setAttribute("aria-label", "Sound bank");
  const bankHead = el("div", "beast2d-sfx-bank-head");
  bankHead.append(el("span", "beast2d-sfx-bank-title", "SOUND BANK"), el("span", "beast2d-sfx-bank-run", "RUN → GAME"));
  const list = el("div", "beast2d-sfx-list");
  const rows: HTMLElement[] = [];
  const rowNames: HTMLElement[] = [];
  const rowBadges: HTMLElement[] = [];
  for (let index = 0; index < SFX_SLOTS; index += 1) {
    const row = el("div", "beast2d-sfx-row");
    const main = el("button", "beast2d-sfx-row-main");
    main.type = "button";
    const slot = el("span", "beast2d-sfx-slot", String(index).padStart(2, "0"));
    const name = el("span", "beast2d-sfx-row-name", "empty");
    const badge = el("span", "beast2d-sfx-row-badge", "GB");
    const play = el("button", "beast2d-sfx-row-play");
    play.type = "button";
    play.title = "Play";
    play.append(el("span", "beast2d-sfx-row-play-icon"));
    play.addEventListener("click", (event) => {
      event.stopPropagation();
      choose(index);
      playSfx(index);
    });
    main.append(slot, name, badge, play);
    main.addEventListener("click", () => choose(index));
    row.append(main);
    list.append(row);
    rows.push(row);
    rowNames.push(name);
    rowBadges.push(badge);
  }
  bank.append(bankHead, list);

  function current(): SfxSound {
    return getSfxBank().slots[selected] ?? getSfxBank().slots[0]!;
  }

  function nextSeed(key: string): number {
    const seed = (seeds.get(key) ?? 0) + 1;
    seeds.set(key, seed);
    return seed;
  }

  function choose(index: number): void {
    selected = Math.max(0, Math.min(SFX_SLOTS - 1, index));
    paint();
  }

  function setChip(chip: LiveChipId): void {
    updateSfxCartChip(chip);
    const sound = current();
    if (sound.chip !== null) {
      updateSfxSlot(selected, (slot) => {
        slot.chip = null;
      });
    }
  }

  function cycleChip(): void {
    const cart = getSfxBank().chip;
    updateSfxCartChip(cart === "pico" ? "gb" : "pico");
    updateSfxSlot(selected, (slot) => {
      if (slot.chip !== null) slot.chip = null;
    });
  }

  function applyPreset(preset: PresetId): void {
    const bankState = getSfxBank();
    const sound = current();
    const patch = generatePreset(preset, effectiveChip(sound.chip, bankState.chip), nextSeed(preset));
    armed = preset;
    updateSfxSlot(selected, (slot) => {
      slot.name = patch.name;
      slot.wave = patch.wave;
      slot.loop = patch.loop;
      slot.knobs = patch.knobs;
      slot.pitch = patch.pitch;
      slot.volume = patch.volume;
    });
  }

  function rollDice(): void {
    const bankState = getSfxBank();
    const sound = current();
    const patch = generateDice(effectiveChip(sound.chip, bankState.chip), nextSeed("dice"));
    armed = "dice";
    updateSfxSlot(selected, (slot) => {
      slot.name = patch.name;
      slot.wave = patch.wave;
      slot.loop = patch.loop;
      slot.knobs = patch.knobs;
      slot.pitch = patch.pitch;
      slot.volume = patch.volume;
    });
  }

  function bindKnob(id: KnobId, button: HTMLButtonElement): void {
    const apply = (clientX: number, clientY: number) => {
      const next = knobValueFromPointer(button, clientX, clientY);
      if (next === null) return;
      armed = null;
      updateSfxSlot(selected, (slot) => {
        slot.knobs[id] = next;
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

  function bindDraw(target: HTMLElement, kind: "pitch" | "volume"): void {
    const draw = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const col = Math.min(31, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * 32)));
      const amount = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
      armed = null;
      updateSfxSlot(selected, (slot) => {
        slot[kind][col] = amount;
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

  function paint(): void {
    const bankState = getSfxBank();
    const sound = current();
    const cartChip = bankState.chip;
    const chipId = effectiveChip(sound.chip, cartChip);
    const spec = CHIPS[chipId];
    if (nameSlot !== selected || document.activeElement !== nameInput) {
      nameInput.value = sound.name;
      nameSlot = selected;
    }
    loopButton.classList.toggle("is-selected", sound.loop);
    const chromeScale =
      Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--beast-scale"), 10) || 1;
    paintSfxRotor(rotorCanvas, cartChip, chromeScale);
    for (const id of CHIP_IDS) {
      const node = chipButtons.get(id);
      node?.classList.toggle("is-on", id === cartChip);
    }
    for (const preset of PRESET_IDS) {
      const button = presetButtons.get(preset);
      const icon = presetIcons.get(preset);
      const on = armed === preset;
      button?.classList.toggle("is-selected", on);
      if (icon) {
        paintSfxPresetIcon(icon, preset, {
          face: on ? "selected" : "cream",
          pressed: button?.classList.contains("is-down"),
        });
      }
    }
    presetChipBadge.textContent = CHIP_LABELS[cartChip];
    paintSfxButton(playIcon, { face: "cream", icon: "play", pressed: playButton.classList.contains("is-down") });
    paintSfxButton(stopIcon, { face: "cream", icon: "stop", pressed: stopButton.classList.contains("is-down") });
    paintSfxButton(loopIcon, {
      face: sound.loop ? "selected" : "cream",
      icon: "loop",
      pressed: loopButton.classList.contains("is-down"),
    });
    paintSfxPresetIcon(diceIcon, "dice", {
      face: "pink",
      pressed: diceButton.classList.contains("is-down"),
    });
    for (const id of WAVE_IDS) {
      const button = waveButtons.get(id);
      if (!button) continue;
      const allowed = spec.waves.includes(id);
      button.disabled = !allowed;
      button.classList.toggle("is-dim", !allowed);
      button.classList.toggle("is-selected", allowed && sound.wave === id);
      const icon = button.querySelector("canvas.beast2d-sfx-wave-icon");
      if (icon instanceof HTMLCanvasElement) paintSfxWaveIcon(icon, id, !allowed);
    }
    sound.pitch.forEach((value, index) => {
      const bar = pitchBars[index];
      if (bar) bar.style.height = `${Math.round(value * 100)}%`;
    });
    sound.volume.forEach((value, index) => {
      const bar = volumeBars[index];
      if (bar) bar.style.height = `${Math.round(value * 100)}%`;
    });
    for (const id of KNOB_IDS) {
      const ui = knobUi.get(id);
      if (!ui) continue;
      const enabled = spec.knobs[id];
      ui.button.disabled = !enabled;
      ui.module.classList.toggle("is-dim", !enabled);
      const shown = id === "duty" ? applyChip(sound, bankState.chip).duty : sound.knobs[id];
      paintSfxKnob(ui.canvas, shown);
      ui.label.textContent = knobLabel(id);
      if (id === "cutoff") {
        ui.button.setAttribute("aria-label", enabled ? "CUT" : "NO GB");
        if (ui.tag) {
          ui.tag.textContent = "NO GB";
          ui.tag.hidden = enabled;
        }
      }
    }
    bankState.slots.forEach((slot, index) => {
      const row = rows[index];
      const empty = slot.name === "" || slot.name === "empty";
      row?.classList.toggle("is-selected", index === selected);
      row?.classList.toggle("is-empty", empty);
      const name = rowNames[index];
      if (name) name.textContent = slot.name || "empty";
      const badge = rowBadges[index];
      if (badge) badge.textContent = CHIPS[effectiveChip(slot.chip, bankState.chip)].label;
    });
    paintPlayhead();
  }

  function paintPlayhead(): void {
    const head = sfxPlayhead();
    rows.forEach((row, index) => row.classList.toggle("is-playing", head?.slot === index));
    if (!head || head.slot !== selected) {
      playhead.classList.remove("is-on");
      return;
    }
    playhead.classList.add("is-on");
    playhead.style.left = `${((head.step + 0.5) / 32) * 100}%`;
  }

  playButton.addEventListener("click", () => playSfx(selected));
  stopButton.addEventListener("click", () => stopSfx());
  loopButton.addEventListener("click", () => {
    updateSfxSlot(selected, (slot) => {
      slot.loop = !slot.loop;
    });
  });
  nameInput.addEventListener("input", () => {
    const value = nameInput.value.slice(0, 16);
    updateSfxSlot(selected, (slot) => {
      slot.name = value;
    });
  });
  bindDraw(pitchRow, "pitch");
  bindDraw(volumeRow, "volume");

  let frame = 0;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    paintPlayhead();
  };
  for (const btn of [playButton, stopButton, loopButton, diceButton, ...presetButtons.values()]) {
    const bump = () => paint();
    btn.addEventListener("pointerdown", bump);
    btn.addEventListener("pointerup", bump);
    btn.addEventListener("pointerleave", bump);
  }

  subscribeSfxBank(paint);
  paint();

  return {
    machine,
    bank,
    setLive(on) {
      if (on && frame === 0) frame = requestAnimationFrame(loop);
      if (!on && frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    handleKey(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return false;
      if (event.key === " " || event.key === "Spacebar") {
        playSfx(selected);
        return true;
      }
      if (event.key === "ArrowUp") {
        choose(selected - 1);
        return true;
      }
      if (event.key === "ArrowDown") {
        choose(selected + 1);
        return true;
      }
      if (event.key === "c" || event.key === "C") {
        cycleChip();
        return true;
      }
      if (event.key === "d" || event.key === "D") {
        rollDice();
        return true;
      }
      return false;
    },
  };
}
