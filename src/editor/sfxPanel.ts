import {
  CHIPS,
  KNOB_IDS,
  SFX_SLOTS,
  WAVE_IDS,
  applyChip,
  effectiveChip,
  type LiveChipId,
  type SfxSound,
} from "../core/sfx/chips";
import { getSfxBank, subscribeSfxBank, updateSfxCartChip, updateSfxSlot } from "../core/sfx/bank";
import { PITCH_MAX, knobTo01 } from "../core/sfx/grid";
import { PRESET_IDS, generateDice, generatePreset, type PresetId } from "../core/sfx/generate";
import { playSfx, sfxPlayhead, stopSfx } from "../core/sfx/synth";
import { paintSfxButton } from "./sfxButtonArt";
import { paintSfxKnob } from "./sfxKnobArt";
import { knobLabel } from "./sfxKnobLabels";
import { paintSfxRotor } from "./sfxRotorArt";
import { paintSfxWaveIcon } from "./sfxWaves";
import { buildSfxBank } from "./sfx/buildSfxBank";
import { buildSfxGrid } from "./sfx/buildSfxGrid";
import { buildSfxHeader } from "./sfx/buildSfxHeader";
import { buildSfxKnobs } from "./sfx/buildSfxKnobs";
import { buildSfxPresets } from "./sfx/buildSfxPresets";
import { syncPresetStripLayout } from "./sfx/syncPresetStrip";

export type SfxDisk = {
  machine: HTMLElement;
  bank: HTMLElement;
  setLive: (on: boolean) => void;
  repaintChrome: () => void;
  handleKey: (event: KeyboardEvent) => boolean;
};

export function mountSfxDisk(): SfxDisk {
  let selected = 3;
  let armed: string | null = null;
  let nameSlot = -1;
  const seeds = new Map<string, number>();

  const machine = document.createElement("section");
  machine.className = "beast2d-sfx";
  machine.setAttribute("aria-label", "SFX");

  const clearArmed = () => {
    armed = null;
  };

  const current = (): SfxSound => getSfxBank().slots[selected] ?? getSfxBank().slots[0]!;

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

  const header = buildSfxHeader(setChip);
  const presetsUi = buildSfxPresets(
    (preset) => applyPreset(preset),
    () => rollDice(),
  );
  const knobsUi = buildSfxKnobs();
  const gridUi = buildSfxGrid(knobsUi.effects, (wave) => {
    clearArmed();
    updateSfxSlot(selected, (sound) => {
      sound.wave = wave;
    });
  });
  const bankUi = buildSfxBank(choose, (index) => {
    choose(index);
    playSfx(index);
  });

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

  function cycleChip(): void {
    const cart = getSfxBank().chip;
    updateSfxCartChip(cart === "pico" ? "gb" : "pico");
    updateSfxSlot(selected, (slot) => {
      if (slot.chip !== null) slot.chip = null;
    });
  }

  machine.append(header.top, presetsUi.presets, gridUi.sequencer);

  function paint(): void {
    const bankState = getSfxBank();
    const sound = current();
    const cartChip = bankState.chip;
    const chipId = effectiveChip(sound.chip, cartChip);
    const spec = CHIPS[chipId];
    if (nameSlot !== selected || document.activeElement !== header.nameInput) {
      header.nameInput.value = sound.name;
      nameSlot = selected;
    }
    header.loopButton.classList.toggle("is-selected", sound.loop);
    const chromeScale =
      Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--beast-scale"), 10) || 1;
    paintSfxRotor(header.rotorCanvas, cartChip, chromeScale);
    for (const [id, node] of header.chipButtons) {
      node.classList.toggle("is-on", id === cartChip);
    }
    for (const preset of PRESET_IDS) {
      const button = presetsUi.presetButtons.get(preset);
      button?.classList.toggle("is-selected", armed === preset);
    }
    presetsUi.diceButton.classList.toggle("is-selected", armed === "dice");
    syncPresetStripLayout(presetsUi.presets);
    paintSfxButton(header.playIcon, { face: "cream", icon: "play", pressed: header.playButton.classList.contains("is-down") });
    paintSfxButton(header.stopIcon, { face: "cream", icon: "stop", pressed: header.stopButton.classList.contains("is-down") });
    paintSfxButton(header.loopIcon, {
      face: sound.loop ? "selected" : "cream",
      icon: "loop",
      pressed: header.loopButton.classList.contains("is-down"),
    });
    for (const id of WAVE_IDS) {
      const button = gridUi.waveButtons.get(id);
      if (!button) continue;
      const allowed = spec.waves.includes(id);
      button.disabled = !allowed;
      button.classList.toggle("is-dim", !allowed);
      button.classList.toggle("is-selected", allowed && sound.wave === id);
      const icon = button.querySelector("canvas.beast2d-sfx-wave-icon");
      if (icon instanceof HTMLCanvasElement) paintSfxWaveIcon(icon, id, !allowed);
    }
    sound.pitch.forEach((value, index) => {
      const bar = gridUi.pitchBars[index];
      if (bar) bar.style.height = `${Math.round((value / PITCH_MAX) * 100)}%`;
    });
    sound.volume.forEach((value, index) => {
      const steps = gridUi.volumeSteps[index];
      if (!steps) return;
      const lit = Math.max(0, Math.min(15, value));
      steps.forEach((block, stepIndex) => {
        block.classList.toggle("is-on", stepIndex < lit);
      });
    });
    for (const id of KNOB_IDS) {
      const ui = knobsUi.knobUi.get(id);
      if (!ui) continue;
      const enabled = spec.knobs[id];
      ui.button.disabled = !enabled;
      ui.module.classList.toggle("is-dim", !enabled);
      const applied = applyChip(sound, bankState.chip);
      const shown = id === "duty" ? applied.duty : knobTo01(sound.knobs[id]);
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
      const row = bankUi.rows[index];
      const empty = slot.name === "" || slot.name === "empty";
      row?.classList.toggle("is-selected", index === selected);
      row?.classList.toggle("is-empty", empty);
      const name = bankUi.rowNames[index];
      if (name) name.textContent = slot.name || "empty";
      const badge = bankUi.rowBadges[index];
      if (badge) badge.textContent = CHIPS[effectiveChip(slot.chip, bankState.chip)].label;
    });
    paintPlayhead();
  }

  function paintPlayhead(): void {
    const head = sfxPlayhead();
    bankUi.rows.forEach((row, index) => row.classList.toggle("is-playing", head?.slot === index));
    if (!head || head.slot !== selected) {
      gridUi.playhead.classList.remove("is-on");
      return;
    }
    gridUi.playhead.classList.add("is-on");
    gridUi.playhead.style.left = `${((head.step + 0.5) / 32) * 100}%`;
  }

  header.playButton.addEventListener("click", () => playSfx(selected));
  header.stopButton.addEventListener("click", () => stopSfx());
  header.loopButton.addEventListener("click", () => {
    updateSfxSlot(selected, (slot) => {
      slot.loop = !slot.loop;
    });
  });
  header.nameInput.addEventListener("input", () => {
    const value = header.nameInput.value.slice(0, 16);
    updateSfxSlot(selected, (slot) => {
      slot.name = value;
    });
  });

  const getSelected = () => selected;
  gridUi.bindInput(getSelected, clearArmed);
  knobsUi.bindKnobs(getSelected, clearArmed);

  let frame = 0;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    paintPlayhead();
  };
  for (const btn of [
    header.playButton,
    header.stopButton,
    header.loopButton,
    presetsUi.diceButton,
    ...presetsUi.presetButtons.values(),
  ]) {
    const bump = () => paint();
    btn.addEventListener("pointerdown", bump);
    btn.addEventListener("pointerup", bump);
    btn.addEventListener("pointerleave", bump);
  }

  subscribeSfxBank(paint);
  const presetStripObserver = new ResizeObserver(() => syncPresetStripLayout(presetsUi.presets));
  presetStripObserver.observe(presetsUi.presets);
  if (machine.parentElement) presetStripObserver.observe(machine.parentElement);
  paint();

  return {
    machine,
    bank: bankUi.bank,
    repaintChrome() {
      paint();
      syncPresetStripLayout(presetsUi.presets);
    },
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