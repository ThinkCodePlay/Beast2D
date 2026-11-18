import type { Cart } from "../core/cart/Cart";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";
import type { GameManager } from "../core/GameManager";
import { compileCart } from "../core/cart/compile";
import { DEFAULT_CONSOLE_DISKS } from "./disks";
import {
  BOOT_DURATION_MS,
  BOOT_SCREEN_ENABLED,
  chromeFontScale,
  fitPreviewScale,
  homeFloppyScale,
} from "./consoleLayout";
import { type ConsoleViewState, type EditorMode } from "./consoleTypes";
import {
  cycleTool,
  goHome,
  initialViewState,
  moveDiskSelection,
  openEditor,
  selectDisk,
  openPlay,
  setEditorMode,
  skipBoot,
} from "./viewState";
import { paintEmptySlot, paintHomeFloppy, paintToolFloppy } from "./pixelArt";
import { loadEditorCart } from "./editorCart";
import { BootScreen } from "./boot/BootScreen";
import { CodeScreen } from "./code/CodeScreen";
import { HomeScreen } from "./home/HomeScreen";
import { RunScreen } from "./run/RunScreen";
import { TopBar } from "./topbar/TopBar";
import { mountSfxDisk } from "./sfxPanel";
import { getSfxBank } from "../core/sfx/bank";
import { serializeSfxBank } from "../core/sfx/format";
import { loadCartSource, saveCartSource } from "./services/cartStorage";
import { pingDevServer, saveCartToDevServer } from "./services/devServer";

export type CartEditorOptions = {
  appRoot: HTMLElement;
  gameContainer: HTMLElement;
  game: GameManager;
  initialSource: string;
  loadCart: (cart: Cart) => Promise<void>;
  loadLevel?: (levelId: string) => Promise<void>;
  fallbackCart?: Cart;
  disks?: typeof DEFAULT_CONSOLE_DISKS;
  skipBoot?: boolean;
  /** `?play=` — skip boot/home and start in run view. */
  playOnly?: boolean;
};

export type CartEditorShell = {
  getSource: () => string;
  getViewState: () => ConsoleViewState;
  setError: (message: string, line?: number, runtime?: boolean) => void;
  clearError: () => void;
  showCode: () => void;
  showRun: () => void;
  showHome: () => void;
  runCart: () => Promise<boolean>;
  saveSource: () => Promise<void>;
  boot: () => Promise<void>;
};

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

export function mountCartEditor(options: CartEditorOptions): CartEditorShell {
  const {
    appRoot,
    gameContainer,
    game,
    initialSource,
    loadCart,
    loadLevel,
    fallbackCart,
    disks = DEFAULT_CONSOLE_DISKS,
    skipBoot: skipBootOption,
    playOnly,
  } = options;

  let saveEnabled = false;
  let viewState: ConsoleViewState = initialViewState({
    skipBoot: skipBootOption || playOnly || !BOOT_SCREEN_ENABLED,
    startScreen: playOnly ? "play" : "home",
  });

  const consoleFrame = document.createElement("div");
  consoleFrame.className = "beast2d-console";

  const boot = new BootScreen(disks.length);
  let bootLoading = false;

  const startSource = loadCartSource(initialSource);
  let shell!: CartEditorShell;

  const topBar = new TopBar(
    disks,
    (tool) => {
      viewState = { ...viewState, activeTool: tool };
      applyViewState();
    },
    () => {
      void shell.saveSource();
    },
    () => {
      void shell.runCart();
    },
  );
  const home = new HomeScreen(disks, (index, disk) => {
    viewState = selectDisk(viewState, index, disks.length);
    applyViewState();
    if (disk.kind === "cart") void openCartEditor();
  });
  const code = new CodeScreen(startSource, {
    onChange: () => {
      saveCartSource(code.getSource());
      if (code.hasVisibleError()) queueMicrotask(() => shell.clearError());
    },
    onRun: () => {
      void shell.runCart();
    },
    onSave: () => {
      void shell.saveSource();
    },
  });
  const run = new RunScreen();
  const sfxDisk = mountSfxDisk();
  code.root.append(sfxDisk.machine);
  sfxDisk.machine.hidden = true;
  run.attachBank(sfxDisk.bank);

  gameContainer.parentElement?.insertBefore(consoleFrame, gameContainer);
  run.attachGame(gameContainer);

  const workspace = document.createElement("div");
  workspace.className = "beast2d-workspace";
  code.mount(workspace);
  run.mount(workspace);

  const footer = document.createElement("footer");
  footer.className = "beast2d-footer-hint";

  const stageBody = document.createElement("div");
  stageBody.className = "beast2d-stage-body";
  stageBody.append(workspace);
  home.mount(stageBody);
  boot.mount(consoleFrame);
  topBar.mount(consoleFrame);
  consoleFrame.append(stageBody, footer);
  appRoot.classList.add("beast2d-app");

  let layoutKey = "";
  const maybeRepaintSfxChrome = () => {
    if (viewState.screen === "editor" && viewState.activeTool === "SFX") {
      sfxDisk.repaintChrome();
    }
  };
  const layoutPreview = () => {
    const fontScale = chromeFontScale(window.innerHeight, window.innerWidth);
    const scaleText = String(fontScale);
    document.documentElement.style.setProperty("--beast-scale", scaleText);
    document.body.style.setProperty("--beast-scale", scaleText);
    consoleFrame.style.setProperty("--beast-scale", scaleText);
    consoleFrame.classList.toggle(
      "beast2d-console-narrow",
      window.innerWidth < 1280,
    );
    const playing = viewState.screen === "play";
    workspace.classList.toggle("beast2d-workspace-play", playing);
    code.root.hidden = playing;
    const padX = 8 * fontScale;
    const padY = 8;
    const consoleW = consoleFrame.clientWidth;
    const workH = workspace.clientHeight;
    let frameW: number;
    let frameH: number;
    let columnFlex: string;
    if (playing) {
      const scale = fitPreviewScale(
        Math.max(0, consoleW - padX * 2),
        Math.max(0, workH - padY * 2),
      );
      frameW = DISPLAY_WIDTH * scale;
      frameH = DISPLAY_HEIGHT * scale;
      columnFlex = "1 1 auto";
    } else {
      const twoXColumn = DISPLAY_WIDTH * 2 + padX * 2;
      const editorShare = Math.floor(consoleW * 0.45);
      const editorFloor = Math.min(
        editorShare,
        Math.max(0, consoleW - twoXColumn),
      );
      const maxPreview = Math.max(DISPLAY_WIDTH, consoleW - editorFloor);
      const scale = fitPreviewScale(
        maxPreview - padX * 2,
        Math.max(0, workH - padY * 2),
      );
      frameW = DISPLAY_WIDTH * scale;
      frameH = DISPLAY_HEIGHT * scale;
      const columnW = Math.min(maxPreview, frameW + padX * 2);
      columnFlex = `0 0 ${columnW}px`;
    }
    const sfxEdit =
      viewState.screen === "editor" &&
      viewState.activeTool === "SFX" &&
      viewState.editorMode !== "run";
    const key = `${fontScale}:${frameW}:${frameH}:${columnFlex}:${playing ? 1 : 0}:${sfxEdit ? 1 : 0}`;
    if (key === layoutKey) {
      maybeRepaintSfxChrome();
      return;
    }
    layoutKey = key;
    run.frame.style.width = `${frameW}px`;
    run.frame.style.height = `${frameH}px`;
    if (sfxEdit) {
      code.root.style.flex = "0 0 62%";
      run.root.style.flex = "0 0 36%";
    } else {
      code.root.style.flex = "";
      run.root.style.flex = columnFlex;
    }
    maybeRepaintSfxChrome();
    repaintFloppies();
  };
  const repaintFloppies = () => {
    const pixel = chromeFontScale(window.innerHeight, window.innerWidth);
    const homePixel = homeFloppyScale(pixel);
    const iconsOnly = window.innerWidth < 1280;
    consoleFrame
      .querySelectorAll<HTMLCanvasElement>(".beast2d-floppy-canvas")
      .forEach((canvas) => {
        const kind = canvas.dataset.floppy;
        if (kind === "tool") {
          const tool = canvas.dataset.tool ?? "CODE";
          paintToolFloppy(
            canvas,
            tool,
            tool === viewState.activeTool,
            pixel,
            iconsOnly,
          );
          return;
        }
        if (kind === "home") {
          const diskId = canvas.dataset.disk ?? "hello";
          const index = disks.findIndex((disk) => disk.id === diskId);
          paintHomeFloppy(
            canvas,
            diskId,
            index === viewState.selectedDiskIndex,
            homePixel,
          );
          return;
        }
        paintEmptySlot(canvas, homePixel);
      });
  };
  layoutPreview();
  window.addEventListener("resize", layoutPreview);
  const previewObserver = new ResizeObserver(() => layoutPreview());
  previewObserver.observe(workspace);
  void document.fonts.load('16px "Monogram"').then(() => {
    code.view.requestMeasure();
    repaintFloppies();
  });

  const selectedDisk = () => disks[viewState.selectedDiskIndex] ?? disks[0]!;

  const syncWorkspace = () => {
    const showSfx =
      viewState.screen === "editor" && viewState.activeTool === "SFX";
    const sfxPreviewGame = showSfx && viewState.editorMode === "run";
    sfxDisk.machine.hidden = !showSfx;
    workspace.classList.toggle("beast2d-workspace-sfx", showSfx);
    workspace.classList.toggle("beast2d-workspace-sfx-run", sfxPreviewGame);
    workspace.classList.toggle(
      "beast2d-workspace-play",
      viewState.screen === "play",
    );
    sfxDisk.setLive(showSfx);
  };

  const hint = (pairs: [string, string][]) =>
    `<span class="beast2d-hints">${pairs
      .map(
        ([key, word]) =>
          `<span class="beast2d-hint"><span class="beast2d-hint-key">${key}</span><span class="beast2d-hint-word">${word}</span></span>`,
      )
      .join("")}</span>`;

  const syncFooter = () => {
    if (viewState.screen === "home") {
      footer.innerHTML = hint([
        ["ENTER", "run"],
        ["E", "edit"],
        ["N", "new"],
      ]);
      return;
    }
    if (viewState.screen === "editor") {
      if (viewState.activeTool === "SFX") {
        footer.innerHTML = hint([
          ["SPACE", "play"],
          ["↑↓", "slot"],
          ["C", "chip"],
          ["D", "dice"],
          ["TAB", "next disk"],
        ]);
        return;
      }
      footer.innerHTML = hint([
        ["TAB", "next disk"],
        ["ESC", "home"],
      ]);
      return;
    }
    if (viewState.screen === "play") {
      footer.innerHTML = hint([["ESC", "home"]]);
      return;
    }
    footer.textContent = "";
  };

  const syncVisibility = () => {
    boot.render({
      hidden: viewState.screen !== "boot",
      loading: bootLoading,
    });
    footer.hidden = viewState.screen === "boot";
  };

  const applyViewState = () => {
    syncVisibility();
    topBar.render(viewState);
    home.render(viewState);
    code.render(viewState);
    run.render(viewState);
    syncWorkspace();
    syncFooter();
    layoutPreview();
    maybeRepaintSfxChrome();
    repaintFloppies();
    if (viewState.screen === "editor" || viewState.screen === "play")
      pokePlayfield();
  };

  const pokePlayfield = () => {
    const canvas = gameContainer.querySelector("canvas");
    if (canvas instanceof HTMLCanvasElement) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }
    const app = globalThis.__PIXI_APP__;
    app?.renderer?.resize(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    app?.render();
  };

  const enterHome = () => {
    viewState = goHome(viewState);
    game.pause();
    applyViewState();
  };

  const enterEditor = (mode: EditorMode) => {
    viewState = openEditor(viewState, mode);
    applyViewState();
    game.resume();
    if (mode === "code") code.view.focus();
  };

  /** E on the cart disk: show the editor and replace whatever level was running. */
  const openCartEditor = async (): Promise<void> => {
    viewState = openEditor(viewState, "code");
    applyViewState();
    try {
      const loaded = await loadEditorCart(shell.getSource(), loadCart);
      if (viewState.screen !== "editor") return;
      if (!loaded.ok) {
        shell.setError(loaded.message, loaded.line);
        return;
      }
    } catch (error) {
      if (viewState.screen === "editor") {
        const message = error instanceof Error ? error.message : String(error);
        shell.setError(message);
      }
      return;
    }
    if (viewState.screen !== "editor") return;
    game.resume();
    pokePlayfield();
    code.view.focus();
  };

  const playSelected = async (): Promise<void> => {
    const disk = selectedDisk();
    viewState = openPlay(viewState);
    applyViewState();
    shell.clearError();
    if (disk.kind === "cart") {
      const result = compileCart(shell.getSource());
      if (!result.ok) {
        shell.setError(result.message, result.line);
        return;
      }
      try {
        await loadCart(result.cart);
        if (viewState.screen === "play") {
          game.resume();
          pokePlayfield();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        shell.setError(message);
      }
      return;
    }
    if (disk.kind === "level" && disk.levelId && loadLevel) {
      try {
        await loadLevel(disk.levelId);
        if (viewState.screen === "play") {
          game.resume();
          pokePlayfield();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        shell.setError(message);
      }
      return;
    }
    shell.setError("This disk is not runnable yet.");
  };

  shell = {
    getSource: () => code.getSource(),
    getViewState: () => ({ ...viewState }),
    setError(message, line, runtime = false) {
      code.showError(message, line, runtime);
      if (viewState.screen !== "editor" || viewState.editorMode !== "code") {
        enterEditor("code");
      }
    },
    clearError() {
      code.clearError();
    },
    showCode() {
      if (viewState.screen !== "editor") enterEditor("code");
      else {
        viewState = setEditorMode(viewState, "code");
        viewState = { ...viewState, activeTool: "CODE" };
        applyViewState();
        game.resume();
        code.view.focus();
      }
    },
    showRun() {
      if (viewState.screen !== "editor") enterEditor("run");
      else {
        viewState = setEditorMode(viewState, "run");
        applyViewState();
        game.resume();
      }
    },
    showHome() {
      enterHome();
    },
    async runCart() {
      shell.clearError();
      const result = compileCart(shell.getSource());
      if (!result.ok) {
        shell.setError(result.message, result.line);
        return false;
      }
      try {
        await loadCart(result.cart);
        shell.showRun();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        shell.setError(message);
        return false;
      }
    },
    async saveSource() {
      if (!saveEnabled) return;
      const saved = await saveCartToDevServer({
        source: shell.getSource(),
        sfx: serializeSfxBank(getSfxBank()),
      });
      if (!saved) {
        shell.setError("Save failed");
        return;
      }
      shell.clearError();
    },
    async boot() {
      saveEnabled = await pingDevServer();
      topBar.setSaveEnabled(saveEnabled);
      applyViewState();

      if (viewState.screen === "boot") {
        requestAnimationFrame(() => {
          bootLoading = true;
          boot.render({ hidden: false, loading: true });
        });
        const bootTimer = window.setTimeout(() => {
          viewState = skipBoot(viewState);
          applyViewState();
        }, BOOT_DURATION_MS);
        const dismissBoot = () => {
          window.clearTimeout(bootTimer);
          viewState = skipBoot(viewState);
          applyViewState();
          window.removeEventListener("keydown", dismissBootKey);
          boot.root.removeEventListener("click", dismissBoot);
        };
        const dismissBootKey = (event: KeyboardEvent) => {
          if (isTextInputTarget(event.target)) return;
          dismissBoot();
        };
        boot.root.addEventListener("click", dismissBoot);
        window.addEventListener("keydown", dismissBootKey);
      }

      if (playOnly) {
        await playSelected();
        return;
      }

      const compiled = compileCart(startSource);
      if (compiled.ok) {
        await loadCart(compiled.cart);
        game.pause();
        return;
      }
      shell.setError(compiled.message, compiled.line);
      enterEditor("code");
      if (fallbackCart) await loadCart(fallbackCart);
    },
  };

  window.addEventListener(
    "keydown",
    (event) => {
      if (viewState.screen === "boot") return;
      if (isTextInputTarget(event.target) && viewState.editorMode === "code") {
        if (event.key !== "Escape") return;
      }

      if (viewState.screen === "home") {
        if (event.key === "ArrowLeft") {
          viewState = moveDiskSelection(viewState, -1, disks.length);
          applyViewState();
          event.preventDefault();
          return;
        }
        if (event.key === "ArrowRight") {
          viewState = moveDiskSelection(viewState, 1, disks.length);
          applyViewState();
          event.preventDefault();
          return;
        }
        if (event.key === "Enter") {
          void playSelected();
          event.preventDefault();
          return;
        }
        if (event.key === "e" || event.key === "E") {
          const disk = selectedDisk();
          if (disk.kind === "cart") {
            event.preventDefault();
            void openCartEditor();
          }
          return;
        }
        if (event.key === "n" || event.key === "N") {
          event.preventDefault();
          return;
        }
      }

      if (viewState.screen === "play") {
        if (event.key === "Escape") {
          enterHome();
          event.preventDefault();
        }
        return;
      }

      if (viewState.screen === "editor") {
        if (viewState.activeTool === "SFX" && sfxDisk.handleKey(event)) {
          event.preventDefault();
          return;
        }
        if (event.key === "Escape") {
          enterHome();
          event.preventDefault();
          return;
        }
        if (event.key === "Tab") {
          const coding =
            viewState.editorMode === "code" && viewState.activeTool === "CODE";
          if (!coding) {
            viewState = cycleTool(viewState);
            applyViewState();
            event.preventDefault();
          }
        }
      }
    },
    true,
  );

  applyViewState();
  return shell;
}
