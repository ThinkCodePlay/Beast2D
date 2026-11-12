export const CONSOLE_TOOLS = ["CODE", "SPRITE", "MAP", "SFX", "MUSIC"] as const;
export type ConsoleTool = (typeof CONSOLE_TOOLS)[number];

export type ConsoleScreen = "boot" | "home" | "editor";

export type EditorMode = "code" | "run";

export type ConsoleViewState = {
  screen: ConsoleScreen;
  activeTool: ConsoleTool;
  editorMode: EditorMode;
  selectedDiskIndex: number;
};

export type DiskKind = "cart" | "level" | "placeholder";

export type ConsoleDisk = {
  id: string;
  title: string;
  kind: DiskKind;
  /** Registered `GameManager` level id when `kind === "level"`. */
  levelId?: string;
  /** Example shipped with the console. User disks leave this unset. */
  builtIn?: boolean;
};
