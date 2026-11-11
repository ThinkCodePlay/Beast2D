import { acceptCompletion, autocompletion, nextSnippetField, prevSnippetField } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { linter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, tooltips, type ViewUpdate } from "@codemirror/view";
import type { Cart } from "../core/cart/Cart";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";
import { computeIntegerDisplayScale, displayCssSize } from "../core/displayScale";
import type { GameManager } from "../core/GameManager";
import { Beast2D16 } from "../core/ui/palette";
import { paintBitmapLabel } from "./bitmapLabel";
import { checkCartSyntax, compileCart } from "../core/cart/compile";
import { cartHelperCompletion } from "./helpers";
import { cartSignatureHints } from "./signature";
import { beast2dEditorTheme, beast2dSyntax } from "./theme";

const STORAGE_KEY = "beast2d-cart-script";
const DEV_PING = "/__beast2d/dev";
const SAVE_URL = "/__beast2d/save-cart";

export type CartEditorOptions = {
  appRoot: HTMLElement;
  gameContainer: HTMLElement;
  game: GameManager;
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
  const { appRoot, gameContainer, game, initialSource, loadCart, fallbackCart } = options;

  let saveEnabled = false;
  let mode: "run" | "code" = "run";
  let runError: { message: string; line?: number } | null = null;

  const consoleFrame = document.createElement("div");
  consoleFrame.className = "beast2d-console";

  const bar = document.createElement("header");
  bar.className = "beast2d-code-bar";

  const title = document.createElement("canvas");
  title.className = "beast2d-bitmap";

  const actions = document.createElement("div");
  actions.className = "beast2d-code-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "beast2d-btn beast2d-btn-ghost";
  const editLabel = document.createElement("canvas");
  editLabel.className = "beast2d-bitmap";
  editButton.appendChild(editLabel);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "beast2d-btn beast2d-btn-save";
  saveButton.disabled = true;
  const saveLabel = document.createElement("canvas");
  saveLabel.className = "beast2d-bitmap";
  saveButton.appendChild(saveLabel);

  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.className = "beast2d-btn beast2d-btn-run";
  const runLabel = document.createElement("canvas");
  runLabel.className = "beast2d-bitmap";
  runButton.appendChild(runLabel);

  actions.appendChild(editButton);
  actions.appendChild(saveButton);
  actions.appendChild(runButton);
  bar.appendChild(title);
  bar.appendChild(actions);

  const stage = document.createElement("div");
  stage.className = "beast2d-stage";
  gameContainer.parentElement?.insertBefore(consoleFrame, gameContainer);
  consoleFrame.append(bar, stage);
  stage.appendChild(gameContainer);

  const codePanel = document.createElement("div");
  codePanel.className = "beast2d-code";
  codePanel.hidden = true;

  const errorStrip = document.createElement("div");
  errorStrip.className = "beast2d-code-error";
  errorStrip.hidden = true;

  const editorMount = document.createElement("div");
  editorMount.className = "beast2d-code-editor";

  codePanel.appendChild(errorStrip);
  codePanel.appendChild(editorMount);
  stage.appendChild(codePanel);

  appRoot.classList.add("beast2d-app");

  const paintChrome = () => {
    const scale = computeIntegerDisplayScale(
      window.innerWidth,
      window.innerHeight,
      DISPLAY_WIDTH,
      DISPLAY_HEIGHT + 16,
      16,
    );
    const stageSize = displayCssSize(scale, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    stage.style.width = `${stageSize.width}px`;
    stage.style.height = `${stageSize.height}px`;
    consoleFrame.style.width = `${stageSize.width}px`;
    bar.style.height = `${16 * scale}px`;
    bar.style.width = "100%";
    const cream = `#${(Beast2D16.Cream & 0xffffff).toString(16).padStart(6, "0")}`;
    const plum = `#${(Beast2D16.PlumOutline & 0xffffff).toString(16).padStart(6, "0")}`;
    if (mode === "code") {
      void paintBitmapLabel(title, "CODE", scale, cream);
      void paintBitmapLabel(
        saveLabel,
        "SAVE",
        scale,
        saveButton.disabled
          ? `#${(Beast2D16.StoneGray & 0xffffff).toString(16).padStart(6, "0")}`
          : cream,
      );
      void paintBitmapLabel(runLabel, "RUN", scale, plum);
      editButton.hidden = true;
      saveButton.hidden = false;
      runButton.hidden = false;
    } else {
      void paintBitmapLabel(title, "PLAY", scale, cream);
      void paintBitmapLabel(editLabel, "ESC EDIT", scale, cream);
      editButton.hidden = false;
      saveButton.hidden = true;
      runButton.hidden = true;
    }
  };
  paintChrome();
  window.addEventListener("resize", paintChrome);

  const stored = localStorage.getItem(STORAGE_KEY);
  const startSource = stored ?? initialSource;

  const extensions: Extension[] = [
    lineNumbers(),
    foldGutter(),
    history(),
    javascript(),
    beast2dEditorTheme,
    beast2dSyntax,
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
      // The banner is the result of the last Run. Editing the script retires it.
      // Defer so this does not dispatch while the editor update is still running.
      if (!errorStrip.hidden) queueMicrotask(() => shell.clearError());
    }),
  ];

  const view = new EditorView({
    state: EditorState.create({ doc: startSource, extensions }),
    parent: editorMount,
  });

  const shell: CartEditorShell = {
    getSource: () => view.state.doc.toString(),
    setError(message, line, runtime = false) {
      runError = runtime ? { message, line } : null;
      errorStrip.textContent = line ? `Line ${line}: ${message}` : message;
      errorStrip.hidden = false;
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
      // The code panel may still be hidden when a running cart fails.
      requestAnimationFrame(mark);
    },
    clearError() {
      runError = null;
      errorStrip.hidden = true;
      errorStrip.textContent = "";
      view.dispatch(setDiagnostics(view.state, cartDiagnostics(view, null)));
    },
    showCode() {
      if (mode === "code") return;
      mode = "code";
      codePanel.hidden = false;
      paintChrome();
      game.pause();
      view.focus();
    },
    showRun() {
      if (mode === "run") return;
      mode = "run";
      codePanel.hidden = true;
      paintChrome();
      game.resume();
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
      paintChrome();

      const compiled = compileCart(startSource);
      if (compiled.ok) {
        await loadCart(compiled.cart);
        return;
      }
      shell.setError(compiled.message);
      shell.showCode();
      if (fallbackCart) await loadCart(fallbackCart);
    },
  };

  editButton.addEventListener("click", () => {
    shell.showCode();
  });
  saveButton.addEventListener("click", () => {
    void shell.saveSource();
  });
  runButton.addEventListener("click", () => {
    void shell.runCart();
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      if (mode === "run") {
        shell.showCode();
        event.preventDefault();
        return;
      }
      shell.showRun();
      event.preventDefault();
    },
    true,
  );

  return shell;
}
