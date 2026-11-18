import {
  acceptCompletion,
  autocompletion,
  nextSnippetField,
  prevSnippetField,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentLess,
  indentMore,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { foldGutter, foldKeymap } from "@codemirror/language";
import { linter, setDiagnostics } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  tooltips,
} from "@codemirror/view";
import type { ConsoleViewState } from "../consoleTypes";
import { cartHelperCompletion } from "../helpers";
import { cartSignatureHints } from "../signature";
import { beast2dEditorTheme, beast2dSyntax } from "../theme";
import type { Screen } from "../ui/Screen";
import { cloneTemplate, requireRef, templateRefs } from "../ui/template";
import { cartDiagnostics } from "./cartDiagnostics";
import html from "./code.html?raw";

type RunError = { message: string; line?: number } | null;

export class CodeScreen implements Screen<ConsoleViewState> {
  readonly root: HTMLElement;
  readonly view: EditorView;
  private readonly codePanel: HTMLElement;
  private readonly stub: HTMLElement;
  private readonly errorStrip: HTMLElement;
  private runError: RunError = null;

  private readonly actions: {
    onChange: () => void;
    onRun: () => void;
    onSave: () => void;
  };

  constructor(
    initialSource: string,
    actions: {
      onChange: () => void;
      onRun: () => void;
      onSave: () => void;
    },
  ) {
    this.actions = actions;
    this.root = cloneTemplate(html);
    const refs = templateRefs(this.root);
    this.stub = requireRef(refs, "stub");
    this.codePanel = requireRef(refs, "code");
    this.errorStrip = requireRef(refs, "error");
    const editorMount = requireRef(refs, "editor");
    this.view = new EditorView({
      state: EditorState.create({
        doc: initialSource,
        extensions: [
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
          linter((view) => cartDiagnostics(view, this.runError), {
            delay: 350,
          }),
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
                this.actions.onRun();
                return true;
              },
            },
            {
              key: "Mod-s",
              run: () => {
                this.actions.onSave();
                return true;
              },
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;
            this.actions.onChange();
          }),
        ],
      }),
      parent: editorMount,
    });
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  getSource(): string {
    return this.view.state.doc.toString();
  }

  hasVisibleError(): boolean {
    return !this.errorStrip.hidden;
  }

  showError(message: string, line?: number, runtime = false): void {
    this.runError = runtime ? { message, line } : null;
    this.errorStrip.textContent = line ? `Line ${line}: ${message}` : message;
    this.errorStrip.hidden = false;
    const mark = () => {
      this.view.dispatch(
        setDiagnostics(
          this.view.state,
          cartDiagnostics(this.view, this.runError),
        ),
      );
      if (line && this.view.state.doc.lines >= 1) {
        const lineObj = this.view.state.doc.line(
          Math.min(line, this.view.state.doc.lines),
        );
        this.view.dispatch({
          selection: { anchor: lineObj.from, head: lineObj.to },
          effects: EditorView.scrollIntoView(lineObj.from, { y: "center" }),
        });
      }
    };
    mark();
    requestAnimationFrame(mark);
  }

  clearError(): void {
    this.runError = null;
    this.errorStrip.hidden = true;
    this.errorStrip.textContent = "";
    this.view.dispatch(
      setDiagnostics(this.view.state, cartDiagnostics(this.view, null)),
    );
  }

  render(state: ConsoleViewState): void {
    const onEditor = state.screen === "editor";
    const showCode = onEditor && state.activeTool === "CODE";
    const showStub =
      onEditor && state.activeTool !== "CODE" && state.activeTool !== "SFX";
    this.codePanel.hidden = !showCode;
    this.stub.hidden = !showStub;
    this.root.hidden = state.screen === "play";
    this.root.classList.toggle(
      "beast2d-editor-column-sfx",
      onEditor && state.activeTool === "SFX",
    );
    if (showCode && state.editorMode === "code") {
      requestAnimationFrame(() => this.view.focus());
    }
  }

  destroy(): void {
    this.view.destroy();
    this.root.remove();
  }
}
