import { Beast2D16 } from "../core/ui/palette";

export function beastColorHex(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Apply Beast2D16 as CSS custom properties on `:root` (documented in style.css). */
export function applyChromePalette(root: HTMLElement = document.documentElement): void {
  const set = (name: string, color: number) => {
    root.style.setProperty(name, beastColorHex(color));
  };
  set("--beast-plum", Beast2D16.PlumOutline);
  set("--beast-shadow", Beast2D16.Shadow);
  set("--beast-stone", Beast2D16.StoneGray);
  set("--beast-cream", Beast2D16.Cream);
  set("--beast-hot-pink", Beast2D16.HotPink);
  set("--beast-leaf", Beast2D16.LeafGreen);
  set("--beast-deep-rose", Beast2D16.DeepRose);
  set("--beast-red", Beast2D16.Red);
  set("--beast-yellow", Beast2D16.Yellow);
  set("--beast-orange", Beast2D16.Orange);
  set("--beast-light-pink", Beast2D16.LightPink);
  set("--beast-sky", Beast2D16.SkyBlue);
}
