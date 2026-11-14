/** Fit seven preset sprites: prefer 2×, fall back to 1×, then tighten gaps. */
export function syncPresetStripLayout(strip: HTMLElement): void {
  const inRun = strip.closest(".beast2d-workspace-sfx-run") !== null;
  strip.classList.remove("beast2d-sfx-presets-use-1x", "beast2d-sfx-presets-tight");

  if (!inRun && strip.scrollWidth > strip.clientWidth + 1) {
    strip.classList.add("beast2d-sfx-presets-use-1x");
  }
  if (inRun) {
    strip.classList.add("beast2d-sfx-presets-use-1x");
  }

  if (strip.scrollWidth > strip.clientWidth + 1) {
    strip.classList.add("beast2d-sfx-presets-tight");
  }
}