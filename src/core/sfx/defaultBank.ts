import { SFX_SLOTS, type LiveChipId, type SfxSound } from "./chips";
import { generatePreset, type PresetId } from "./generate";
import { emptySound, type SfxBank } from "./format";

function fill(
  slots: SfxSound[],
  index: number,
  name: string,
  preset: PresetId,
  chip: LiveChipId | null,
  seed: number,
): void {
  const patch = generatePreset(preset, chip ?? "gb", seed);
  slots[index] = {
    ...patch,
    name,
    chip,
  };
}

/** Sixteen slots. A few are filled so the disk is not a blank bank. */
export function createDefaultSfxBank(): SfxBank {
  const slots = Array.from({ length: SFX_SLOTS }, () => emptySound());
  fill(slots, 0, "jump", "jump", null, 1);
  fill(slots, 1, "coin", "coin", null, 2);
  fill(slots, 2, "hit", "hit", null, 3);
  fill(slots, 3, "laser_01", "shoot", null, 4);
  fill(slots, 4, "boom_big", "boom", null, 5);
  fill(slots, 5, "power_up", "power", null, 6);
  fill(slots, 6, "enemy_die", "boom", null, 7);
  fill(slots, 7, "select", "coin", "pico", 8);
  return { version: 1, chip: "gb", slots };
}