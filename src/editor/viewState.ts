import { CONSOLE_TOOLS, type ConsoleTool, type ConsoleViewState, type EditorMode } from "./consoleTypes";

export function initialViewState(options: {
  skipBoot?: boolean;
  startScreen?: "home" | "editor" | "play";
  editorMode?: EditorMode;
} = {}): ConsoleViewState {
  const screen = options.skipBoot ? (options.startScreen ?? "home") : "boot";
  return {
    screen,
    activeTool: "CODE",
    editorMode: options.editorMode ?? "run",
    selectedDiskIndex: 0,
  };
}

/** Leave the boot screen for Home. Skip and the timer share this transition. */
export function skipBoot(state: ConsoleViewState): ConsoleViewState {
  if (state.screen !== "boot") return state;
  return { ...state, screen: "home" };
}

export function goHome(state: ConsoleViewState): ConsoleViewState {
  return { ...state, screen: "home", editorMode: "run" };
}

export function openEditor(state: ConsoleViewState, mode: EditorMode = "code"): ConsoleViewState {
  return { ...state, screen: "editor", editorMode: mode, activeTool: "CODE" };
}

/** Full playfield inside the console. The editor split stays on `openEditor`. */
export function openPlay(state: ConsoleViewState): ConsoleViewState {
  return { ...state, screen: "play" };
}

export function setEditorMode(state: ConsoleViewState, mode: EditorMode): ConsoleViewState {
  if (state.screen !== "editor") return state;
  return { ...state, editorMode: mode };
}

export function cycleTool(state: ConsoleViewState): ConsoleViewState {
  if (state.screen !== "editor") return state;
  const idx = CONSOLE_TOOLS.indexOf(state.activeTool);
  const next = CONSOLE_TOOLS[(idx + 1) % CONSOLE_TOOLS.length]!;
  return { ...state, activeTool: next };
}

export function selectDisk(state: ConsoleViewState, index: number, diskCount: number): ConsoleViewState {
  if (diskCount <= 0) return state;
  const clamped = Math.max(0, Math.min(index, diskCount - 1));
  return { ...state, selectedDiskIndex: clamped };
}

export function moveDiskSelection(state: ConsoleViewState, delta: number, diskCount: number): ConsoleViewState {
  return selectDisk(state, state.selectedDiskIndex + delta, diskCount);
}

export function isToolFunctional(tool: ConsoleTool): boolean {
  return tool === "CODE";
}
