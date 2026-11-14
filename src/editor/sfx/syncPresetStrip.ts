/** Fit seven preset sprites: prefer 2×, fall back to 1×, then tighten gaps. */
export function syncPresetStripLayout(strip: HTMLElement): void {
  strip.classList.remove("beast2d-sfx-presets-tight");

  if (strip.scrollWidth > strip.clientWidth + 1) {
    strip.classList.add("beast2d-sfx-presets-tight");
  }
}