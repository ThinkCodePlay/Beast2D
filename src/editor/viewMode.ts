export type ShellViewMode = "split" | "expanded";

export type BeastPlaySurface = "editor" | "standalone";

export function parsePlaySurface(search: string): BeastPlaySurface {
  const params = new URLSearchParams(search);
  return params.get("play") === "cart" ? "standalone" : "editor";
}

export function standaloneCartUrl(href: string): string {
  const url = new URL(href);
  url.searchParams.set("play", "cart");
  url.searchParams.delete("resetCart");
  return url.toString();
}

/** Escape from expanded layout returns to split; otherwise unchanged. */
export function viewModeAfterEscape(mode: ShellViewMode): ShellViewMode {
  return mode === "expanded" ? "split" : mode;
}

export function shellClassForViewMode(mode: ShellViewMode): string {
  return mode === "expanded" ? "beast2d-view-expanded" : "beast2d-view-split";
}
