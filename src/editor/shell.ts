import { acceptCompletion, autocompletion, nextSnippetField, prevSnippetField } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { linter, lintGutter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
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
import { computeIntegerDisplayScale, displayCssSize } from "../core/displayScale";
import type { Engine } from "../core/Engine";
import type { GameManager } from "../core/GameManager";
import { Beast2D16 } from "../core/ui/palette";
import { applyChromePalette, beastColorHex } from "./chromeColors";
import { paintBitmapLabel } from "./bitmapLabel";
import { EDITOR_CHROME_SCALE_COMPACT, EDITOR_CHROME_SCALE_TOP } from "./chromeScale";
import { checkCartSyntax, compileCart } from "../core/cart/compile";
import { cartHelperCompletion } from "./helpers";
import { cartSignatureHints } from "./signature";
import { beast2dEditorTheme, beast2dSyntax } from "./theme";
import {
  shellClassForViewMode,
  standaloneCartUrl,
  type ShellViewMode,
  viewModeAfterEscape,
} from "./viewMode";

const STORAGE_KEY = "beast2d-cart-script";
const DEV_PING = "/__beast2d/dev";
const SAVE_URL = "/__beast2d/save-cart";
const CARD_PADDING_PX = 16;
const GAME_BEZEL_PADDING = 12;

const RUN_PLAY_ICON = `<svg class="beast2d-run-icon" width="12" height="12" viewBox="0 0 10 10" aria-hidden="true"><path fill="currentColor" d="M2 1.5 8.5 5 2 8.5Z"/></svg>`;

export type CartEditorOptions = {
  appRoot: HTMLElement;
  gameContainer: HTMLElement;
  game: GameManager;
  engine: Engine;
  initialSource: string;
  loadCart: (cart: Cart) => Promise<void>;
  fallbackCart?: Cart;
};

export type CartEditorShell = {
  getSource: () => string;
  setError: (message: string, line?: number, runtime?: boolean) => void;
  clearError: () => void;
  showCode: () => void;
  showRun: () => void;
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

export function mountCartEditor(options: CartEditorOptions): CartEditorShell {
  const { appRoot, gameContainer, game, engine, initialSource, loadCart, fallbackCart } = options;

  applyChromePalette();

  let saveEnabled = false;
  let viewMode: ShellViewMode = "split";
  let runError: { message: string; line?: number } | null = null;
  let scanlinesEnabled = false;
  let gameScale = 2;

  gameContainer.remove();
  appRoot.replaceChildren();
  appRoot.classList.add("beast2d-app");

  const shellRoot = document.createElement("div");
  shellRoot.className = "beast2d-shell beast2d-view-split";

  const topBar = document.createElement("header");
  topBar.className = "beast2d-topbar";

  const logo = document.createElement("canvas");
  logo.className = "beast2d-bitmap beast2d-logo";

  const topBarCenter = document.createElement("div");
  topBarCenter.className = "beast2d-topbar-center";

  const modeSwitch = document.createElement("nav");
  modeSwitch.className = "beast2d-mode-switch";
  modeSwitch.setAttribute("aria-label", "Workspace mode");

  const codeModeBtn = document.createElement("button");
  codeModeBtn.type = "button";
  codeModeBtn.className = "beast2d-mode-btn beast2d-mode-active";
  codeModeBtn.textContent = "CODE";

  const playModeBtn = document.createElement("button");
  playModeBtn.type = "button";
  playModeBtn.className = "beast2d-mode-btn";
  playModeBtn.textContent = "PLAY";

  modeSwitch.append(codeModeBtn, playModeBtn);
  topBarCenter.appendChild(modeSwitch);

  const topActions = document.createElement("div");
  topActions.className = "beast2d-topbar-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "beast2d-btn beast2d-btn-text";
  saveButton.textContent = "SAVE";
  saveButton.disabled = true;
  saveButton.hidden = true;

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.className = "beast2d-btn beast2d-btn-run";
  runButton.innerHTML = `${RUN_PLAY_ICON}<span class="beast2d-run-label">RUN</span>`;

  const clock = document.createElement("canvas");
  clock.className = "beast2d-bitmap beast2d-clock";

  topActions.append(saveButton, runButton, clock);
  topBar.append(logo, topBarCenter, topActions);

  const main = document.createElement("div");
  main.className = "beast2d-main";

  const toolPanel = document.createElement("section");
  toolPanel.className = "beast2d-tool-panel beast2d-card";

  const editorMount = document.createElement("div");
  editorMount.className = "beast2d-code-editor";

  const codePanel = document.createElement("div");
  codePanel.className = "beast2d-code-panel";
  codePanel.appendChild(editorMount);
  toolPanel.appendChild(codePanel);

  const gamePanel = document.createElement("section");
  gamePanel.className = "beast2d-game-panel beast2d-card beast2d-preview-card";

  const previewHeader = document.createElement("div");
  previewHeader.className = "beast2d-preview-header";

  const previewHeading = document.createElement("div");
  previewHeading.className = "beast2d-preview-heading";
  const previewTitle = document.createElement("span");
  previewTitle.className = "beast2d-preview-title";
  previewTitle.textContent = "PREVIEW";
  const previewHeart = document.createElement("span");
  previewHeart.className = "beast2d-preview-heart";
  previewHeart.textContent = "♥";
  previewHeart.setAttribute("aria-hidden", "true");
  const previewRes = document.createElement("span");
  previewRes.className = "beast2d-preview-res";
  previewRes.textContent = `${DISPLAY_WIDTH}×${DISPLAY_HEIGHT}`;
  previewHeading.append(previewTitle, previewHeart, previewRes);

  const previewActions = document.createElement("div");
  previewActions.className = "beast2d-preview-actions";

  const expandButton = document.createElement("button");
  expandButton.type = "button";
  expandButton.className = "beast2d-btn beast2d-btn-quiet";
  expandButton.textContent = "EXPAND";
  expandButton.title = "Expand preview (Esc to return)";

  const standaloneButton = document.createElement("button");
  standaloneButton.type = "button";
  standaloneButton.className = "beast2d-btn beast2d-btn-quiet";
  standaloneButton.textContent = "POP OUT";
  standaloneButton.title = "Open game in standalone window";

  const scanlineToggle = document.createElement("label");
  scanlineToggle.className = "beast2d-scanline-toggle";
  const scanlineInput = document.createElement("input");
  scanlineInput.type = "checkbox";
  scanlineInput.className = "beast2d-scanline-input";
  const scanlineText = document.createElement("span");
  scanlineText.className = "beast2d-scanline-label";
  scanlineText.textContent = "SCAN";
  scanlineToggle.append(scanlineInput, scanlineText);

  previewActions.append(expandButton, standaloneButton, scanlineToggle);
  previewHeader.append(previewHeading, previewActions);

  const gameFrame = document.createElement("div");
  gameFrame.className = "beast2d-game-frame";
  gameFrame.tabIndex = -1;

  const gameBezel = document.createElement("div");
  gameBezel.className = "beast2d-game-bezel";
  gameBezel.appendChild(gameContainer);
  gameFrame.appendChild(gameBezel);

  const gameFooter = document.createElement("div");
  gameFooter.className = "beast2d-game-footer";
  gameFooter.textContent = `FPS -- | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${gameScale}`;

  gamePanel.append(previewHeader, gameFrame, gameFooter);
  main.append(toolPanel, gamePanel);

  const errorStrip = document.createElement("div");
  errorStrip.className = "beast2d-error-strip";
  errorStrip.hidden = true;

  const errorIconWrap = document.createElement("div");
  errorIconWrap.className = "beast2d-error-icon-wrap";
  const errorIcon = document.createElement("canvas");
  errorIcon.className = "beast2d-bitmap beast2d-error-icon";

  const errorBody = document.createElement("div");
  errorBody.className = "beast2d-error-body";
  const errorLinePrefix = document.createElement("span");
  errorLinePrefix.className = "beast2d-error-line";
  errorLinePrefix.hidden = true;
  const errorMessage = document.createElement("span");
  errorMessage.className = "beast2d-error-message";

  errorIconWrap.appendChild(errorIcon);
  errorBody.append(errorLinePrefix, errorMessage);
  errorStrip.append(errorIconWrap, errorBody);

  shellRoot.append(topBar, main, errorStrip);
  appRoot.appendChild(shellRoot);

  let clockKey = "";

  const clockText = (now = new Date()) => {
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const paintClock = () => {
    const nextClock = clockText();
    if (nextClock === clockKey) return;
    clockKey = nextClock;
    void paintBitmapLabel(clock, nextClock, EDITOR_CHROME_SCALE_TOP, beastColorHex(Beast2D16.LeafGreen));
  };

  const paintLogo = () => {
    void paintBitmapLabel(logo, "BEAST2D", EDITOR_CHROME_SCALE_TOP, beastColorHex(Beast2D16.Cream));
  };

  const syncModeButtons = () => {
    const split = viewMode === "split";
    codeModeBtn.classList.toggle("beast2d-mode-active", split);
    playModeBtn.classList.toggle("beast2d-mode-active", !split);
    codeModeBtn.setAttribute("aria-selected", String(split));
    playModeBtn.setAttribute("aria-selected", String(!split));
    expandButton.textContent = split ? "EXPAND" : "SPLIT";
  };

  const setViewMode = (mode: ShellViewMode) => {
    viewMode = mode;
    shellRoot.classList.remove("beast2d-view-split", "beast2d-view-expanded");
    shellRoot.classList.add(shellClassForViewMode(viewMode));
    syncModeButtons();
    layoutGameFrame();
  };

  const layoutGameFrame = () => {
    const expanded = viewMode === "expanded";
    const gap = 8;
    let availW: number;
    let availH: number;
    if (expanded) {
      const mainRect = main.getBoundingClientRect();
      availW = mainRect.width - CARD_PADDING_PX * 2;
      availH = mainRect.height - CARD_PADDING_PX * 2;
    } else {
      availW = gamePanel.clientWidth - CARD_PADDING_PX * 2;
      availH =
        gamePanel.clientHeight -
        previewHeader.offsetHeight -
        gameFooter.offsetHeight -
        CARD_PADDING_PX * 2 -
        gap;
    }
    const innerW = Math.max(0, availW - GAME_BEZEL_PADDING * 2);
    const innerH = Math.max(0, availH - GAME_BEZEL_PADDING * 2);
    const scale = computeIntegerDisplayScale(innerW, innerH, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0);
    gameScale = scale;
    const size = displayCssSize(scale, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    gameContainer.style.width = `${size.width}px`;
    gameContainer.style.height = `${size.height}px`;
    gameBezel.style.width = `${size.width + GAME_BEZEL_PADDING * 2}px`;
    gameBezel.style.height = `${size.height + GAME_BEZEL_PADDING * 2}px`;
    gameBezel.dataset.displayScale = String(scale);
    gameFooter.textContent = `FPS ${Math.round(engine.app.ticker.FPS)} | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${scale}`;
  };

  paintLogo();
  paintClock();
  syncModeButtons();
  layoutGameFrame();

  const onResize = () => {
    paintLogo();
    layoutGameFrame();
  };
  window.addEventListener("resize", onResize);
  window.setInterval(() => paintClock(), 1000);

  requestAnimationFrame(function tickFooter() {
    if (!document.hidden) {
      const fps = Math.round(engine.app.ticker.FPS);
      gameFooter.textContent = `FPS ${fps} | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${gameScale}`;
    }
    requestAnimationFrame(tickFooter);
  });

  const gameLayoutObserver = new ResizeObserver(() => layoutGameFrame());
  gameLayoutObserver.observe(gamePanel);
  gameLayoutObserver.observe(main);

  const stored = localStorage.getItem(STORAGE_KEY);
  const startSource = stored ?? initialSource;

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
    lintGutter(),
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

  const flashErrorLine = () => {
    codePanel.classList.add("beast2d-error-flash");
    window.setTimeout(() => codePanel.classList.remove("beast2d-error-flash"), 900);
  };

  const shell: CartEditorShell = {
    getSource: () => view.state.doc.toString(),
    setError(message, line, runtime = false) {
      runError = runtime ? { message, line } : null;
      if (line) {
        errorLinePrefix.hidden = false;
        errorLinePrefix.textContent = `Line ${line}: `;
        errorMessage.textContent = message;
      } else {
        errorLinePrefix.hidden = true;
        errorLinePrefix.textContent = "";
        errorMessage.textContent = message;
      }
      errorStrip.hidden = false;
      errorStrip.classList.add("beast2d-error-strip-visible");
      void paintBitmapLabel(errorIcon, "!", EDITOR_CHROME_SCALE_COMPACT, beastColorHex(Beast2D16.PlumOutline));
      const mark = () => {
        view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, runError)));
        if (!line || view.state.doc.lines < 1) return;
        const lineObj = view.state.doc.line(Math.min(line, view.state.doc.lines));
        view.dispatch({
          selection: { anchor: lineObj.from, head: lineObj.to },
          effects: EditorView.scrollIntoView(lineObj.from, { y: "center" }),
        });
      };
      mark();
      requestAnimationFrame(mark);
      flashErrorLine();
    },
    clearError() {
      runError = null;
      errorStrip.hidden = true;
      errorStrip.classList.remove("beast2d-error-strip-visible");
      errorLinePrefix.hidden = true;
      errorLinePrefix.textContent = "";
      errorMessage.textContent = "";
      view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, null)));
    },
    showCode() {
      game.pause();
      setViewMode("split");
      view.focus();
    },
    showRun() {
      game.resume();
      layoutGameFrame();
    },
    async runCart() {
      shell.clearError();
      const result = compileCart(shell.getSource());
      if (!result.ok) {
        shell.setError(result.message, result.line);
        shell.showCode();
        return false;
      }
      try {
        await loadCart(result.cart);
        shell.showRun();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        shell.setError(message);
        shell.showCode();
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
      saveButton.hidden = !saveEnabled;

      const compiled = compileCart(startSource);
      if (compiled.ok) {
        await loadCart(compiled.cart);
        return;
      }
      shell.setError(compiled.message, compiled.line);
      shell.showCode();
      if (fallbackCart) await loadCart(fallbackCart);
    },
  };

  saveButton.addEventListener("click", () => {
    void shell.saveSource();
  });
  runButton.addEventListener("click", () => {
    void shell.runCart();
  });

  codeModeBtn.addEventListener("click", () => {
    setViewMode("split");
    game.pause();
    view.focus();
  });

  playModeBtn.addEventListener("click", () => {
    setViewMode("expanded");
    game.resume();
    gameFrame.focus();
  });

  expandButton.addEventListener("click", () => {
    const next = viewMode === "expanded" ? "split" : "expanded";
    setViewMode(next);
    if (next === "expanded") {
      game.resume();
      gameFrame.focus();
    } else {
      game.pause();
      view.focus();
    }
  });

  standaloneButton.addEventListener("click", () => {
    window.open(standaloneCartUrl(window.location.href), "_blank", "noopener,noreferrer");
  });

  scanlineInput.addEventListener("change", () => {
    scanlinesEnabled = scanlineInput.checked;
    gameBezel.classList.toggle("beast2d-scanlines", scanlinesEnabled);
    scanlineText.classList.toggle("beast2d-scanline-label-on", scanlinesEnabled);
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      if (viewMode !== "expanded") return;
      if (event.target instanceof Element && view.dom.contains(event.target)) return;
      viewMode = viewModeAfterEscape(viewMode);
      setViewMode(viewMode);
      game.pause();
      view.focus();
      event.preventDefault();
    },
    true,
  );

  return shell;
}
