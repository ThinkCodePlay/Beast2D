import { describe, expect, it } from "vitest";
import {
  cycleTool,
  goHome,
  initialViewState,
  isToolFunctional,
  moveDiskSelection,
  openEditor,
  openPlay,
  setEditorMode,
  skipBoot,
} from "../src/editor/viewState";

describe("console view state", () => {
  it("starts on boot unless skipBoot", () => {
    expect(initialViewState().screen).toBe("boot");
    expect(initialViewState({ skipBoot: true }).screen).toBe("home");
    expect(initialViewState({ skipBoot: true, startScreen: "editor" }).screen).toBe("editor");
    expect(initialViewState({ skipBoot: true, startScreen: "play" }).screen).toBe("play");
  });

  it("leaves boot for home, and ignores the transition off boot", () => {
    const boot = initialViewState();
    expect(skipBoot(boot).screen).toBe("home");
    expect(skipBoot(skipBoot(boot)).screen).toBe("home");
  });

  it("opens a full playfield without entering the editor split", () => {
    const home = initialViewState({ skipBoot: true });
    const play = openPlay(home);
    expect(play.screen).toBe("play");
    expect(play.editorMode).toBe("run");
    expect(goHome(play).screen).toBe("home");
  });

  it("opens editor and sets mode", () => {
    const home = skipBoot(initialViewState());
    const editor = openEditor(home, "code");
    expect(editor.screen).toBe("editor");
    expect(editor.editorMode).toBe("code");
    expect(setEditorMode(editor, "run").editorMode).toBe("run");
  });

  it("ESC home resets editor mode", () => {
    const editor = openEditor(initialViewState({ skipBoot: true }), "code");
    const home = goHome(editor);
    expect(home.screen).toBe("home");
    expect(home.editorMode).toBe("run");
  });

  it("cycles tools on the editor screen only", () => {
    const editor = openEditor(initialViewState({ skipBoot: true }), "code");
    const next = cycleTool(editor);
    expect(next.activeTool).toBe("SPRITE");
    expect(cycleTool(goHome(editor)).activeTool).toBe("CODE");
  });

  it("moves disk selection with clamping", () => {
    const home = initialViewState({ skipBoot: true });
    const moved = moveDiskSelection(home, 2, 4);
    expect(moved.selectedDiskIndex).toBe(2);
    expect(moveDiskSelection(moved, 99, 4).selectedDiskIndex).toBe(3);
    expect(moveDiskSelection(moved, -99, 4).selectedDiskIndex).toBe(0);
  });

  it("marks only CODE as functional", () => {
    expect(isToolFunctional("CODE")).toBe(true);
    expect(isToolFunctional("MAP")).toBe(false);
  });
});
