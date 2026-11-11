import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const plum = "#1f1424";
const shadow = "#3b2e3f";
const stone = "#746678";
const cream = "#f4ead2";
const magenta = "#c1386e";
const yellow = "#f1c766";
const orange = "#e28649";
export const beast2dEditorTheme = EditorView.theme(
  {
    "&": {
      color: cream,
      backgroundColor: plum,
    },
    ".cm-content": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: "16px",
      lineHeight: "24px",
      caretColor: cream,
    },
    ".cm-gutters": {
      backgroundColor: shadow,
      color: stone,
      border: "none",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: "16px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: shadow,
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(58, 91, 147, 0.18)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "rgba(58, 91, 147, 0.45)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: cream,
    },
    ".cm-foldPlaceholder": {
      backgroundColor: shadow,
      border: "none",
      color: cream,
    },
  },
  { dark: true },
);

export const beast2dHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: magenta },
  { tag: tags.string, color: yellow },
  { tag: tags.number, color: orange },
  { tag: tags.comment, color: stone, fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: cream },
  { tag: tags.variableName, color: cream },
]);

export const beast2dSyntax = syntaxHighlighting(beast2dHighlight);
