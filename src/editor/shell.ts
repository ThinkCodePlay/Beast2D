import { acceptCompletion, autocompletion, nextSnippetField, prevSnippetField } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { linter, type Diagnostic } from "@codemirror/lint";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, tooltips, type ViewUpdate } from "@codemirror/view";
import type { Cart } from "../core/cart/Cart";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../core/display";
import { computeIntegerDisplayScale, displayCssSize } from "../core/displayScale";
import type { GameManager } from "../core/GameManager";
import { paintBitmapLabel } from "./bitmapLabel";
import { checkCartSyntax, compileCart } from "./compileCart";
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
  setError: (message: string) => void;
  clearError: () => void;
  showCode: () => void;
  showRun: () => void;
  runCart: () => Promise<boolean>;
  saveSource: () => Promise<void>;
  boot: () => Promise<void>;
};

function cartSyntaxDiagnostics(view: EditorView): Diagnostic[] {
  const syntax = checkCartSyntax(view.state.doc.toString());
  if (syntax.ok) return [];
  const line = Math.min(syntax.line ?? 1, view.state.doc.lines);
  const lineObj = view.state.doc.line(line);
  return [
    {
      from: lineObj.from,
      to: lineObj.to,
      severity: "error",
      message: syntax.message,
    },
  ];
}

export function mountCartEditor(options: CartEditorOptions): CartEditorShell {
  const { appRoot, gameContainer, game, initialSource, loadCart, fallbackCart } = options;

  let saveEnabled = false;
  let mode: "run" | "code" = "run";

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
    const cream = "#f4ead2";
    const plum = "#1f1424";
    if (mode === "code") {
      void paintBitmapLabel(title, "CODE", scale, cream);
      void paintBitmapLabel(saveLabel, "SAVE", scale, saveButton.disabled ? "#746678" : cream);
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
    linter(cartSyntaxDiagnostics, { delay: 350 }),
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
      if (update.docChanged) {
        localStorage.setItem(STORAGE_KEY, update.state.doc.toString());
      }
    }),
  ];

  const view = new EditorView({
    state: EditorState.create({ doc: startSource, extensions }),
    parent: editorMount,
  });

  const shell: CartEditorShell = {
    getSource: () => view.state.doc.toString(),
    setError(message) {
      errorStrip.textContent = message;
      errorStrip.hidden = false;
    },
    clearError() {
      errorStrip.hidden = true;
      errorStrip.textContent = "";
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
        shell.setError(result.message);
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
