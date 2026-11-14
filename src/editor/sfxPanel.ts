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
import { paintSfxWaveIcon } from "./sfxWaves";

const ROTOR_ANGLE: Record<(typeof CHIP_IDS)[number], number> = {
  pico: 315,
  gb: 225,
  snes: 45,
  gen: 135,
};

type ModuleTone = "yellow" | "orange";

type SfxModule = { title: string; knobs: readonly KnobId[]; tone: ModuleTone; note: boolean };

const KNOB_ROWS: SfxModule[][] = [
  [
    { title: "OUTPUT", knobs: ["vol"], tone: "yellow", note: false },
    { title: "ENVELOPE", knobs: ["attack", "decay"], tone: "orange", note: false },
    { title: "SPEED", knobs: ["rate"], tone: "yellow", note: false },
  ],
  [
    { title: "SLIDE", knobs: ["slide"], tone: "yellow", note: false },
    { title: "VIBRATO", knobs: ["vibrato"], tone: "yellow", note: false },
    { title: "DUTY", knobs: ["duty"], tone: "yellow", note: false },
    { title: "FILTER", knobs: ["cutoff"], tone: "yellow", note: true },
  ],
];

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

function dutyText(sound: SfxSound, cart: LiveChipId): string {
  const pct = applyChip(sound, cart).duty * 100;
  return `${Number.isInteger(pct) ? String(pct) : pct.toFixed(1)}%`;
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
  const playButton = el("button", "beast2d-sfx-btn beast2d-sfx-btn-pink beast2d-sfx-icon-btn");
  playButton.type = "button";
  playButton.title = "Play";
  playButton.append(el("span", "beast2d-sfx-play-icon"));
  const stopButton = el("button", "beast2d-sfx-btn beast2d-sfx-icon-btn");
  stopButton.type = "button";
  stopButton.title = "Stop";
  stopButton.append(el("span", "beast2d-sfx-stop-icon"));
  const loopButton = el("button", "beast2d-sfx-btn beast2d-sfx-icon-btn");
  loopButton.type = "button";
  loopButton.title = "Loop";
  loopButton.append(el("span", "beast2d-sfx-loop-icon", "↻"));
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
  const dial = el("div", "beast2d-sfx-dial");
  const needle = el("i", "beast2d-sfx-needle");
  dial.append(needle);
  const chipButtons = new Map<string, HTMLElement>();
  for (const id of CHIP_IDS) {
    const live = CHIPS[id].live;
    const chip = live ? el("button", `beast2d-sfx-chip beast2d-sfx-chip-${id}`, CHIP_LABELS[id]) : el("span", `beast2d-sfx-chip beast2d-sfx-chip-${id} is-dim`, CHIP_LABELS[id]);
    if (chip instanceof HTMLButtonElement) chip.type = "button";
    chipButtons.set(id, chip);
    rotor.append(chip);
  }
  rotor.append(dial);
  top.append(transport, nameLcd, rotor);

  const presets = el("div", "beast2d-sfx-presets");
  const presetButtons = new Map<string, HTMLButtonElement>();
  const presetBadges = new Map<string, HTMLElement>();
  for (const preset of PRESET_IDS) {
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-preset");
    button.type = "button";
    const badge = el("span", "beast2d-sfx-preset-badge", "GB");
    const label = el("span", "beast2d-sfx-preset-name", preset.toUpperCase());
    button.append(badge, label);
    pressable(button);
    button.addEventListener("click", () => applyPreset(preset));
    presetButtons.set(preset, button);
    presetBadges.set(preset, badge);
    presets.append(button);
  }
  const diceButton = el("button", "beast2d-sfx-btn beast2d-sfx-btn-pink", "DICE");
  diceButton.type = "button";
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
    const button = el("button", "beast2d-sfx-btn beast2d-sfx-wave");
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
  mid.append(gridWrap, waves);

  const body = el("div", "beast2d-sfx-body");
  const knobs = el("div", "beast2d-sfx-knobs");
  const knobUi = new Map<KnobId, { button: HTMLButtonElement; needle: HTMLElement; label: HTMLElement; module: HTMLElement; note: HTMLElement | null }>();
  KNOB_ROWS.forEach((modules, rowIndex) => {
    const knobRow = el("div", `beast2d-sfx-knob-row beast2d-sfx-knob-row-${rowIndex + 1}`);
    for (const module of modules) {
      const box = el("section", `beast2d-sfx-mod beast2d-sfx-mod-${module.tone} beast2d-sfx-mod-${module.title.toLowerCase()}`);
      box.append(el("div", "beast2d-sfx-mod-title", module.title));
      const note = module.note ? el("div", "beast2d-sfx-mod-note", "") : null;
      if (note) box.append(note);
      const row = el("div", "beast2d-sfx-mod-knobs");
      for (const id of module.knobs) {
        const button = el("button", "beast2d-sfx-knob");
        button.type = "button";
        button.setAttribute("aria-label", knobLabel(id));
        const needle = el("i", "beast2d-sfx-knob-needle");
        const label = el("span", "beast2d-sfx-knob-label", knobLabel(id));
        button.append(needle);
        const wrap = el("div", "beast2d-sfx-knob-wrap");
        wrap.append(button, label);
        row.append(wrap);
        knobUi.set(id, { button, needle, label, module: box, note });
        bindKnob(id, button);
      }
      box.append(row);
      knobRow.append(box);
    }
    knobs.append(knobRow);
  });

  body.append(mid, knobs);
  machine.append(top, presets, body);

  const bank = el("section", "beast2d-sfx-bank");
  bank.setAttribute("aria-label", "Sound bank");
  const bankHead = el("div", "beast2d-sfx-bank-head");
  bankHead.append(el("span", "beast2d-sfx-bank-title", "SOUND BANK"), el("span", "beast2d-sfx-bank-run", "RUN = GAME HERE"));
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

  function setCartChip(chip: LiveChipId): void {
    updateSfxCartChip(chip);
    updateSfxSlot(selected, (slot) => {
      if (slot.chip !== null) slot.chip = null;
    });
  }

  function cycleChip(): void {
    const cart = getSfxBank().chip;
    setCartChip(cart === "pico" ? "gb" : "pico");
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
    button.addEventListener("pointerdown", (event) => {
      if (button.disabled) return;
      event.preventDefault();
      armed = null;
      const startY = event.clientY;
      const start = current().knobs[id];
      button.classList.add("is-down");
      const move = (ev: PointerEvent) => {
        const next = Math.min(1, Math.max(0, start + (startY - ev.clientY) / 90));
        updateSfxSlot(selected, (slot) => {
          slot.knobs[id] = next;
        });
      };
      const up = () => {
        button.classList.remove("is-down");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
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
    needle.style.transform = `rotate(${ROTOR_ANGLE[cartChip]}deg)`;
    for (const id of CHIP_IDS) {
      const node = chipButtons.get(id);
      node?.classList.toggle("is-on", id === cartChip);
    }
    for (const preset of PRESET_IDS) {
      presetButtons.get(preset)?.classList.toggle("is-selected", armed === preset);
      const badge = presetBadges.get(preset);
      if (badge) badge.textContent = CHIPS[cartChip].label;
    }
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
      ui.needle.style.transform = `rotate(${-140 + shown * 280}deg)`;
      ui.label.textContent = id === "duty" ? dutyText(sound, bankState.chip) : knobLabel(id);
      if (ui.note) ui.note.textContent = enabled ? "" : "NO GB";
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
    setCartChip(live as LiveChipId);
  });
  chipButtons.forEach((node, id) => {
    if (!(node instanceof HTMLButtonElement)) return;
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      setCartChip(id as LiveChipId);
    });
  });

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
