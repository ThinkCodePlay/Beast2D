/** Fit seven preset sprites: prefer 2×, fall back to 1×, then tighten gaps. */
export function syncPresetStripLayout(strip: HTMLElement): void {
  const machine = strip.closest(".beast2d-sfx");
  const inRun = strip.closest(".beast2d-workspace-sfx-run") !== null;
  strip.classList.remove("beast2d-sfx-presets-tight");
  machine?.classList.remove("beast2d-sfx-keys-use-1x");

  let use1x = inRun;
  if (!inRun && strip.scrollWidth > strip.clientWidth + 1) {
    use1x = true;
  }
  if (use1x) {
    machine?.classList.add("beast2d-sfx-keys-use-1x");
  }

  if (strip.scrollWidth > strip.clientWidth + 1) {
    strip.classList.add("beast2d-sfx-presets-tight");
  }
}