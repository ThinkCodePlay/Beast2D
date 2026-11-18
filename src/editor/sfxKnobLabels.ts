import type { KnobId } from "../core/sfx/chips";

export function knobLabel(id: KnobId): string {
  if (id === "vol") return "VOL";
  if (id === "attack") return "ATK";
  if (id === "decay") return "DEC";
  if (id === "rate") return "RATE";
  if (id === "slide") return "SLD";
  if (id === "vibrato") return "VIB";
  if (id === "duty") return "DUTY";
  return "CUT";
}
