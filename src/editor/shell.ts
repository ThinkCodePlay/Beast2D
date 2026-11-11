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

const RUN_PLAY_ICON = `<svg class="beast2d-run-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path fill="currentColor" d="M2 1.5 8.5 5 2 8.5Z"/></svg>`;

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

function chromeBitmapScale(): number {
  return Math.max(2, Math.min(4, Math.round(window.innerHeight / 280)));
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

  const tabBar = document.createElement("nav");
  tabBar.className = "beast2d-tabs";
  tabBar.setAttribute("aria-label", "Tools");

  const codeTab = document.createElement("button");
  codeTab.type = "button";
  codeTab.className = "beast2d-tab beast2d-tab-active";
  codeTab.setAttribute("aria-selected", "true");
  const codeTabLabel = document.createElement("canvas");
  codeTabLabel.className = "beast2d-bitmap";
  codeTab.appendChild(codeTabLabel);
  tabBar.appendChild(codeTab);

  const topActions = document.createElement("div");
  topActions.className = "beast2d-topbar-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "beast2d-btn beast2d-btn-ghost";
  saveButton.disabled = true;
  saveButton.hidden = true;
  const saveLabel = document.createElement("canvas");
  saveLabel.className = "beast2d-bitmap";
  saveButton.appendChild(saveLabel);

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.className = "beast2d-btn beast2d-btn-run";
  runButton.innerHTML = RUN_PLAY_ICON;
  const runLabel = document.createElement("canvas");
  runLabel.className = "beast2d-bitmap";
  runButton.appendChild(runLabel);

  const clock = document.createElement("canvas");
  clock.className = "beast2d-bitmap beast2d-clock";

  topActions.append(saveButton, runButton, clock);
  topBar.append(logo, tabBar, topActions);

  const main = document.createElement("div");
  main.className = "beast2d-main";

  const toolPanel = document.createElement("section");
  toolPanel.className = "beast2d-tool-panel";

  const editorMount = document.createElement("div");
  editorMount.className = "beast2d-code-editor";

  const codePanel = document.createElement("div");
  codePanel.className = "beast2d-code-panel";
  codePanel.appendChild(editorMount);
  toolPanel.appendChild(codePanel);

  const gamePanel = document.createElement("section");
  gamePanel.className = "beast2d-game-panel";

  const gameControls = document.createElement("div");
  gameControls.className = "beast2d-game-controls";

  const expandButton = document.createElement("button");
  expandButton.type = "button";
  expandButton.className = "beast2d-btn beast2d-btn-ghost beast2d-btn-compact";
  expandButton.title = "Expand game (Esc to return)";
  const expandLabel = document.createElement("canvas");
  expandLabel.className = "beast2d-bitmap";
  expandButton.appendChild(expandLabel);

  const standaloneButton = document.createElement("button");
  standaloneButton.type = "button";
  standaloneButton.className = "beast2d-btn beast2d-btn-ghost beast2d-btn-compact";
  standaloneButton.title = "Open game in standalone window";
  const standaloneLabel = document.createElement("canvas");
  standaloneLabel.className = "beast2d-bitmap";
  standaloneButton.appendChild(standaloneLabel);

  const scanlineToggle = document.createElement("label");
  scanlineToggle.className = "beast2d-scanline-toggle";
  const scanlineInput = document.createElement("input");
  scanlineInput.type = "checkbox";
  scanlineInput.className = "beast2d-scanline-input";
  const scanlineText = document.createElement("canvas");
  scanlineText.className = "beast2d-bitmap";
  scanlineToggle.append(scanlineInput, scanlineText);

  gameControls.append(expandButton, standaloneButton, scanlineToggle);

  const gameFrame = document.createElement("div");
  gameFrame.className = "beast2d-game-frame";
  gameFrame.tabIndex = -1;
  gameFrame.appendChild(gameContainer);

  const gameFooter = document.createElement("div");
  gameFooter.className = "beast2d-game-footer";
  gameFooter.textContent = `FPS -- | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${gameScale}`;

  gamePanel.append(gameControls, gameFrame, gameFooter);
  main.append(toolPanel, gamePanel);

  const errorStrip = document.createElement("div");
  errorStrip.className = "beast2d-error-strip";
  errorStrip.hidden = true;
  const errorIcon = document.createElement("canvas");
  errorIcon.className = "beast2d-bitmap beast2d-error-icon";
  const errorText = document.createElement("span");
  errorText.className = "beast2d-error-text";
  errorStrip.append(errorIcon, errorText);

  shellRoot.append(topBar, main, errorStrip);
  appRoot.appendChild(shellRoot);

  let clockKey = "";
  let chromeKey = "";

  const clockText = (now = new Date()) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    let hour = now.getHours();
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    const minute = String(now.getMinutes()).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${days[now.getDay()]} ${day} ${hour}:${minute}${suffix}`;
  };

  const paintClock = (scale: number) => {
    const nextClock = `${scale}:${clockText()}`;
    if (nextClock === clockKey) return;
    clockKey = nextClock;
    void paintBitmapLabel(clock, clockText(), scale, beastColorHex(Beast2D16.LeafGreen));
  };

  const applyViewMode = () => {
    shellRoot.classList.remove("beast2d-view-split", "beast2d-view-expanded");
    shellRoot.classList.add(shellClassForViewMode(viewMode));
  };

  const layoutGameFrame = () => {
    const padding = 24;
    const footerLine = 24;
    const controlsLine = 28;
    const rect = gameFrame.getBoundingClientRect();
    const expanded = viewMode === "expanded";
    const availW = expanded
      ? Math.max(0, window.innerWidth - padding * 2)
      : rect.width > 0
        ? rect.width - padding
        : gamePanel.clientWidth - padding;
    const availH = expanded
      ? Math.max(0, window.innerHeight - topBar.offsetHeight - footerLine - controlsLine - padding * 2)
      : rect.height > 0
        ? rect.height - padding
        : Math.max(
            120,
            window.innerHeight - topBar.offsetHeight - footerLine - controlsLine - 80,
          );
    const scale = computeIntegerDisplayScale(availW, availH, DISPLAY_WIDTH, DISPLAY_HEIGHT, 0);
    gameScale = scale;
    const size = displayCssSize(scale, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    gameContainer.style.width = `${size.width}px`;
    gameContainer.style.height = `${size.height}px`;
    gameFrame.dataset.displayScale = String(scale);
    gameFooter.textContent = `FPS ${Math.round(engine.app.ticker.FPS)} | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${scale}`;
  };

  const paintChrome = () => {
    const scale = chromeBitmapScale();
    const cream = beastColorHex(Beast2D16.Cream);
    const hotPink = beastColorHex(Beast2D16.HotPink);
    const stone = beastColorHex(Beast2D16.StoneGray);
    const nextKey = `${scale}:${saveEnabled}:${saveButton.disabled}:${viewMode}`;
    if (nextKey === chromeKey) {
      paintClock(scale);
      layoutGameFrame();
      return;
    }
    chromeKey = nextKey;

    void paintBitmapLabel(logo, "BEAST2D", scale, cream);
    void paintBitmapLabel(codeTabLabel, "CODE", scale, hotPink);
    void paintBitmapLabel(
      saveLabel,
      "SAVE",
      scale,
      saveButton.disabled ? stone : cream,
    );
    void paintBitmapLabel(runLabel, "RUN", scale, beastColorHex(Beast2D16.PlumOutline));
    void paintBitmapLabel(expandLabel, viewMode === "expanded" ? "SPLIT" : "EXPAND", scale, cream);
    void paintBitmapLabel(standaloneLabel, "POP OUT", scale, cream);
    void paintBitmapLabel(scanlineText, "SCAN", scale, scanlinesEnabled ? hotPink : stone);
    paintClock(scale);
    layoutGameFrame();
  };

  paintChrome();
  window.addEventListener("resize", paintChrome);
  window.setInterval(() => paintClock(chromeBitmapScale()), 1000);
  requestAnimationFrame(function tickFooter() {
    if (!document.hidden) {
      const fps = Math.round(engine.app.ticker.FPS);
      gameFooter.textContent = `FPS ${fps} | ${DISPLAY_WIDTH}×${DISPLAY_HEIGHT} | x${gameScale}`;
    }
    requestAnimationFrame(tickFooter);
  });

  const gameFrameObserver = new ResizeObserver(() => layoutGameFrame());
  gameFrameObserver.observe(gameFrame);

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
      errorText.textContent = line ? `Line ${line}: ${message}` : message;
      errorStrip.hidden = false;
      errorStrip.classList.add("beast2d-error-strip-visible");
      void paintBitmapLabel(errorIcon, "!", chromeBitmapScale(), beastColorHex(Beast2D16.HotPink));
      const mark = () => {
        view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, runError)));
        if (!line || view.state.doc.lines < 1) return;
        const lineObj = view.state.doc.line(Math.min(line, view.state.doc.lines));
        view.dispatch({
          selection: { anchor: lineObj.from },
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
      errorText.textContent = "";
      view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, null)));
    },
    showCode() {
      game.pause();
      viewMode = "split";
      applyViewMode();
      paintChrome();
      view.focus();
    },
    showRun() {
      game.resume();
      paintChrome();
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
      paintChrome();

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

  expandButton.addEventListener("click", () => {
    viewMode = viewMode === "expanded" ? "split" : "expanded";
    applyViewMode();
    paintChrome();
    if (viewMode === "expanded") gameFrame.focus();
    else view.focus();
  });

  standaloneButton.addEventListener("click", () => {
    window.open(standaloneCartUrl(window.location.href), "_blank", "noopener,noreferrer");
  });

  scanlineInput.addEventListener("change", () => {
    scanlinesEnabled = scanlineInput.checked;
    gameFrame.classList.toggle("beast2d-scanlines", scanlinesEnabled);
    paintChrome();
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      if (viewMode !== "expanded") return;
      if (event.target instanceof Element && view.dom.contains(event.target)) return;
      viewMode = viewModeAfterEscape(viewMode);
      applyViewMode();
      paintChrome();
      view.focus();
      event.preventDefault();
    },
    true,
  );

  applyViewMode();
  return shell;
}
