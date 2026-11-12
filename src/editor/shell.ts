import { acceptCompletion, autocompletion, nextSnippetField, prevSnippetField } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { linter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { EditorState, type Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  tooltips,
  type ViewUpdate,
} from "@codemirror/view";
import type { Cart } from "../core/cart/Cart";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";
import type { GameManager } from "../core/GameManager";
import { checkCartSyntax, compileCart } from "../core/cart/compile";
import { DEFAULT_CONSOLE_DISKS } from "./disks";
import { BOOT_DURATION_MS, chromeFontScale, fitPreviewScale, homeFloppyScale } from "./consoleLayout";
import { CONSOLE_TOOLS, type ConsoleTool, type ConsoleViewState, type EditorMode } from "./consoleTypes";
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
} from "./viewState";
import { cartHelperCompletion } from "./helpers";
import { cartSignatureHints } from "./signature";
import { beast2dEditorTheme, beast2dSyntax } from "./theme";
import { clockText } from "./clock";
import { paintEmptySlot, paintHomeFloppy, paintToolFloppy } from "./pixelArt";
import { loadEditorCart } from "./editorCart";

const STORAGE_KEY = "beast2d-cart-script";
const DEV_PING = "/__beast2d/dev";
const SAVE_URL = "/__beast2d/save-cart";

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

function lineDiagnostic(view: EditorView, line: number | undefined, message: string): Diagnostic | null {
  if (!line || view.state.doc.lines < 1) return null;
  const lineObj = view.state.doc.line(Math.min(line, view.state.doc.lines));
  return { from: lineObj.from, to: lineObj.to, severity: "error", message };
}

function cartDiagnostics(
  view: EditorView,
  runError: { message: string; line?: number } | null,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const syntax = checkCartSyntax(view.state.doc.toString());
  if (!syntax.ok) {
    const mark = lineDiagnostic(view, syntax.line ?? 1, syntax.message);
    if (mark) diagnostics.push(mark);
  }
  if (runError) {
    const mark = lineDiagnostic(view, runError.line, runError.message);
    if (mark) diagnostics.push(mark);
  }
  return diagnostics;
}

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
  let runError: { message: string; line?: number } | null = null;
  let viewState: ConsoleViewState = initialViewState({
    skipBoot: skipBootOption || playOnly,
    startScreen: playOnly ? "play" : "home",
  });

  const consoleFrame = document.createElement("div");
  consoleFrame.className = "beast2d-console";

  const bootOverlay = document.createElement("div");
  bootOverlay.className = "beast2d-boot";
  const bootBrand = document.createElement("div");
  bootBrand.className = "beast2d-boot-brand";
  const bootTitle = document.createElement("div");
  bootTitle.className = "beast2d-boot-title";
  bootTitle.textContent = "BEAST2D";
  const bootMascot = document.createElement("img");
  bootMascot.className = "beast2d-mascot";
  bootMascot.alt = "";
  bootMascot.src = "/ui/mascot.png";
  bootBrand.append(bootTitle, bootMascot);
  const bootCopy = document.createElement("div");
  bootCopy.className = "beast2d-boot-copy";
  const bootLine = (text: string) => {
    const line = document.createElement("div");
    line.textContent = text;
    return line;
  };
  const bootStatus = document.createElement("div");
  bootStatus.className = "beast2d-boot-status";
  bootStatus.append(bootLine(`Loading disks... ${disks.length} found`));
  const bootBlock = document.createElement("span");
  bootBlock.className = "beast2d-boot-block";
  bootStatus.append(bootBlock);
  const bootTrack = document.createElement("div");
  bootTrack.className = "beast2d-boot-track";
  const bootFill = document.createElement("div");
  bootFill.className = "beast2d-boot-fill";
  bootTrack.append(bootFill);
  const bootPrompt = document.createElement("div");
  bootPrompt.className = "beast2d-boot-prompt";
  bootPrompt.textContent = "press any key";
  bootCopy.append(
    bootLine("BEAST2D OS v0.1"),
    bootLine("(c) 2026 ThinkCodePlay"),
    bootLine("320x240 16 colors Monogram"),
    bootStatus,
    bootTrack,
  );
  bootOverlay.append(bootBrand, bootCopy, bootPrompt);

  const bar = document.createElement("header");
  bar.className = "beast2d-top-bar";

  const breadcrumb = document.createElement("div");
  breadcrumb.className = "beast2d-breadcrumb";

  const actions = document.createElement("div");
  actions.className = "beast2d-top-actions";

  const clockEl = document.createElement("span");
  clockEl.className = "beast2d-clock";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "beast2d-top-save";
  saveButton.textContent = "SAVE";
  saveButton.disabled = true;

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.className = "beast2d-top-run";
  runButton.textContent = "RUN";

  actions.append(clockEl, saveButton, runButton);
  bar.append(breadcrumb, actions);

  const diskRow = document.createElement("div");
  diskRow.className = "beast2d-tool-row";
  const toolTabs = CONSOLE_TOOLS.map((tool) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "beast2d-tool-tab";
    tab.dataset.tool = tool;
    tab.disabled = !isToolFunctional(tool);
    const glyph = document.createElement("canvas");
    glyph.className = "beast2d-floppy-canvas";
    glyph.dataset.floppy = "tool";
    glyph.dataset.tool = tool;
    tab.appendChild(glyph);
    tab.addEventListener("click", () => {
      if (!isToolFunctional(tool)) return;
      viewState = { ...viewState, activeTool: tool };
      applyViewState();
    });
    diskRow.appendChild(tab);
    return tab;
  });

  const homePanel = document.createElement("div");
  homePanel.className = "beast2d-home";
  const homeBrand = document.createElement("div");
  homeBrand.className = "beast2d-home-brand";
  const homeLogo = document.createElement("div");
  homeLogo.className = "beast2d-home-logo";
  homeLogo.textContent = "BEAST2D";
  const mascot = document.createElement("img");
  mascot.className = "beast2d-mascot";
  mascot.alt = "";
  mascot.src = "/ui/mascot.png";
  homeBrand.append(homeLogo, mascot);
  const homeShelf = document.createElement("div");
  homeShelf.className = "beast2d-home-shelf";
  const newDiskSlot = document.createElement("button");
  newDiskSlot.type = "button";
  newDiskSlot.className = "beast2d-home-disk beast2d-home-disk-new";
  newDiskSlot.title = "Coming soon";
  const emptySlot = document.createElement("canvas");
  emptySlot.className = "beast2d-floppy-canvas";
  emptySlot.dataset.floppy = "empty";
  const newTitle = document.createElement("span");
  newTitle.className = "beast2d-home-disk-title";
  newTitle.textContent = "+ New disk";
  newDiskSlot.append(emptySlot, newTitle);

  const diskButtons = disks.map((disk, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "beast2d-home-disk";
    btn.dataset.diskIndex = String(index);
    const face = document.createElement("canvas");
    face.className = "beast2d-floppy-canvas";
    face.dataset.floppy = "home";
    face.dataset.disk = disk.id;
    const title = document.createElement("span");
    title.className = "beast2d-home-disk-title";
    title.textContent = disk.title;
    btn.append(face, title);
    btn.addEventListener("click", () => {
      viewState = moveDiskSelection(viewState, index - viewState.selectedDiskIndex, disks.length);
      applyViewState();
    });
    homeShelf.appendChild(btn);
    return btn;
  });
  homeShelf.appendChild(newDiskSlot);
  homePanel.append(homeBrand, homeShelf);

  const workspace = document.createElement("div");
  workspace.className = "beast2d-workspace";

  const editorColumn = document.createElement("div");
  editorColumn.className = "beast2d-editor-column";

  const codePanel = document.createElement("div");
  codePanel.className = "beast2d-code";

  const errorStrip = document.createElement("div");
  errorStrip.className = "beast2d-code-error";
  errorStrip.hidden = true;

  const stubPanel = document.createElement("div");
  stubPanel.className = "beast2d-tool-stub";
  stubPanel.hidden = true;
  stubPanel.textContent = "Coming soon";

  const editorMount = document.createElement("div");
  editorMount.className = "beast2d-code-editor";

  codePanel.append(errorStrip, editorMount);
  editorColumn.append(stubPanel, codePanel);

  const previewColumn = document.createElement("div");
  previewColumn.className = "beast2d-preview-column";
  const previewFrame = document.createElement("div");
  previewFrame.className = "beast2d-preview-frame";

  gameContainer.parentElement?.insertBefore(consoleFrame, gameContainer);
  previewFrame.appendChild(gameContainer);
  previewColumn.appendChild(previewFrame);

  workspace.append(editorColumn, previewColumn);

  const footer = document.createElement("footer");
  footer.className = "beast2d-footer-hint";

  const stageBody = document.createElement("div");
  stageBody.className = "beast2d-stage-body";
  stageBody.append(workspace, homePanel);
  consoleFrame.append(bootOverlay, bar, diskRow, stageBody, footer);
  appRoot.classList.add("beast2d-app");

  let layoutKey = "";
  const layoutPreview = () => {
    const fontScale = chromeFontScale(window.innerHeight);
    document.documentElement.style.setProperty("--beast-scale", String(fontScale));
    const playing = viewState.screen === "play";
    workspace.classList.toggle("beast2d-workspace-play", playing);
    editorColumn.hidden = playing;
    const padX = 8 * fontScale;
    const padY = 8;
    const consoleW = consoleFrame.clientWidth;
    const workH = workspace.clientHeight;
    let frameW: number;
    let frameH: number;
    let columnFlex: string;
    if (playing) {
      const scale = fitPreviewScale(Math.max(0, consoleW - padX * 2), Math.max(0, workH - padY * 2));
      frameW = DISPLAY_WIDTH * scale;
      frameH = DISPLAY_HEIGHT * scale;
      columnFlex = "1 1 auto";
    } else {
      const twoXColumn = DISPLAY_WIDTH * 2 + padX * 2;
      const editorShare = Math.floor(consoleW * 0.45);
      const editorFloor = Math.min(editorShare, Math.max(0, consoleW - twoXColumn));
      const maxPreview = Math.max(DISPLAY_WIDTH, consoleW - editorFloor);
      const scale = fitPreviewScale(maxPreview - padX * 2, Math.max(0, workH - padY * 2));
      frameW = DISPLAY_WIDTH * scale;
      frameH = DISPLAY_HEIGHT * scale;
      const columnW = Math.min(maxPreview, frameW + padX * 2);
      columnFlex = `0 0 ${columnW}px`;
    }
    const key = `${fontScale}:${frameW}:${frameH}:${columnFlex}:${playing ? 1 : 0}`;
    if (key === layoutKey) return;
    layoutKey = key;
    previewFrame.style.width = `${frameW}px`;
    previewFrame.style.height = `${frameH}px`;
    previewColumn.style.flex = columnFlex;
    repaintFloppies();
  };
  const repaintFloppies = () => {
    const pixel = chromeFontScale(window.innerHeight);
    const homePixel = homeFloppyScale(pixel);
    consoleFrame.querySelectorAll<HTMLCanvasElement>(".beast2d-floppy-canvas").forEach((canvas) => {
      const kind = canvas.dataset.floppy;
      if (kind === "tool") {
        const tool = canvas.dataset.tool ?? "CODE";
        // Native 64×72. Scaling these with the device ate the height a 2× playfield needs.
        paintToolFloppy(canvas, tool, tool === viewState.activeTool, 1);
        return;
      }
      if (kind === "home") {
        const diskId = canvas.dataset.disk ?? "hello";
        const index = disks.findIndex((disk) => disk.id === diskId);
        paintHomeFloppy(canvas, diskId, index === viewState.selectedDiskIndex, homePixel);
        return;
      }
      paintEmptySlot(canvas, homePixel);
    });
  };
  layoutPreview();
  window.addEventListener("resize", layoutPreview);
  const previewObserver = new ResizeObserver(() => layoutPreview());
  previewObserver.observe(workspace);
  window.setInterval(() => {
    clockEl.textContent = clockText();
  }, 1000);
  clockEl.textContent = clockText();

  const stored = localStorage.getItem(STORAGE_KEY);
  const startSource = stored ?? initialSource;

  let shell!: CartEditorShell;

  const extensions: Extension[] = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    drawSelection(),
    foldGutter(),
    history(),
    javascript(),
    beast2dEditorTheme,
    beast2dSyntax,
    EditorView.lineWrapping,
    tooltips({ parent: document.body }),
    autocompletion({ override: [cartHelperCompletion] }),
    cartSignatureHints,
    linter((view) => cartDiagnostics(view, runError), { delay: 350 }),
    keymap.of([
      { key: "Tab", run: acceptCompletion, shift: prevSnippetField },
      { key: "Tab", run: nextSnippetField, shift: indentLess },
      { key: "Tab", run: indentMore, shift: indentLess },
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      {
        key: "Mod-Enter",
        run: () => {
          void shell.runCart();
          return true;
        },
      },
      {
        key: "Mod-s",
        run: () => {
          void shell.saveSource();
          return true;
        },
      },
    ]),
    EditorView.updateListener.of((update: ViewUpdate) => {
      if (!update.docChanged) return;
      localStorage.setItem(STORAGE_KEY, update.state.doc.toString());
      if (!errorStrip.hidden) queueMicrotask(() => shell.clearError());
    }),
  ];

  const view = new EditorView({
    state: EditorState.create({ doc: startSource, extensions }),
    parent: editorMount,
  });
  void document.fonts.load('16px "Monogram"').then(() => {
    view.requestMeasure();
    repaintFloppies();
  });

  const selectedDisk = () => disks[viewState.selectedDiskIndex] ?? disks[0]!;

  const syncToolTabs = () => {
    for (const tab of toolTabs) {
      const tool = tab.dataset.tool as ConsoleTool;
      const active = viewState.activeTool === tool;
      tab.classList.toggle("beast2d-tool-tab-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    }
    repaintFloppies();
  };

  const syncHomeSelection = () => {
    diskButtons.forEach((btn, i) => {
      btn.classList.toggle("beast2d-home-disk-selected", i === viewState.selectedDiskIndex);
    });
    repaintFloppies();
  };

  const syncEditorPanes = () => {
    const onEditorScreen = viewState.screen === "editor";
    const showCode = onEditorScreen && viewState.activeTool === "CODE";
    const showStub = onEditorScreen && viewState.activeTool !== "CODE";
    codePanel.hidden = !showCode;
    stubPanel.hidden = !showStub;
    if (showCode && viewState.editorMode === "code") {
      requestAnimationFrame(() => view.focus());
    }
  };

  const syncHeader = () => {
    const disk = selectedDisk();
    if (viewState.screen === "home" || viewState.screen === "boot") {
      breadcrumb.textContent = "BEAST2D OS";
      saveButton.hidden = true;
      runButton.hidden = true;
      return;
    }
    if (viewState.screen === "play") {
      breadcrumb.textContent = `BEAST2D OS > ${disk.title}`;
      saveButton.hidden = true;
      runButton.hidden = true;
      return;
    }
    breadcrumb.textContent = `BEAST2D OS > ${disk.title}`;
    const showCartActions = viewState.activeTool === "CODE";
    saveButton.hidden = !showCartActions;
    runButton.hidden = !showCartActions;
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
    bootOverlay.hidden = viewState.screen !== "boot";
    homePanel.hidden = viewState.screen !== "home";
    bar.hidden = viewState.screen === "boot";
    diskRow.hidden = viewState.screen !== "editor";
    footer.hidden = viewState.screen === "boot";
  };

  const applyViewState = () => {
    syncVisibility();
    syncHeader();
    syncFooter();
    syncToolTabs();
    syncHomeSelection();
    syncEditorPanes();
    layoutPreview();
    if (viewState.screen === "editor" || viewState.screen === "play") pokePlayfield();
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
    if (mode === "code") view.focus();
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
    view.focus();
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
    getSource: () => view.state.doc.toString(),
    getViewState: () => ({ ...viewState }),
    setError(message, line, runtime = false) {
      runError = runtime ? { message, line } : null;
      errorStrip.textContent = line ? `Line ${line}: ${message}` : message;
      errorStrip.hidden = false;
      const mark = () => {
        view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, runError)));
        if (line && view.state.doc.lines >= 1) {
          const lineObj = view.state.doc.line(Math.min(line, view.state.doc.lines));
          view.dispatch({
            selection: { anchor: lineObj.from, head: lineObj.to },
            effects: EditorView.scrollIntoView(lineObj.from, { y: "center" }),
          });
        }
      };
      mark();
      requestAnimationFrame(mark);
      if (viewState.screen !== "editor" || viewState.editorMode !== "code") {
        enterEditor("code");
      }
    },
    clearError() {
      runError = null;
      errorStrip.hidden = true;
      errorStrip.textContent = "";
      view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, null)));
    },
    showCode() {
      if (viewState.screen !== "editor") enterEditor("code");
      else {
        viewState = setEditorMode(viewState, "code");
        viewState = { ...viewState, activeTool: "CODE" };
        applyViewState();
        game.resume();
        view.focus();
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
      const response = await fetch(SAVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: shell.getSource() }),
      });
      if (!response.ok) {
        shell.setError("Save failed");
        return;
      }
      shell.clearError();
    },
    async boot() {
      const ping = await fetch(DEV_PING, { method: "GET" }).catch(() => null);
      saveEnabled = ping?.ok === true;
      saveButton.disabled = !saveEnabled;
      applyViewState();

      if (viewState.screen === "boot") {
        requestAnimationFrame(() => bootOverlay.classList.add("is-loading"));
        const bootTimer = window.setTimeout(() => {
          viewState = skipBoot(viewState);
          applyViewState();
        }, BOOT_DURATION_MS);
        const dismissBoot = () => {
          window.clearTimeout(bootTimer);
          viewState = skipBoot(viewState);
          applyViewState();
          window.removeEventListener("keydown", dismissBootKey);
          bootOverlay.removeEventListener("click", dismissBoot);
        };
        const dismissBootKey = (event: KeyboardEvent) => {
          if (isTextInputTarget(event.target)) return;
          dismissBoot();
        };
        bootOverlay.addEventListener("click", dismissBoot);
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

  saveButton.addEventListener("click", () => {
    void shell.saveSource();
  });
  runButton.addEventListener("click", () => {
    void shell.runCart();
  });

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
        if (event.key === "Escape") {
          enterHome();
          event.preventDefault();
          return;
        }
        if (event.key === "Tab") {
          const coding = viewState.editorMode === "code" && viewState.activeTool === "CODE";
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
