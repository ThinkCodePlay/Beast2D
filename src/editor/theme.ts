import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/** Beast2D 16, used like a PV8 screen: yellow words, green calls, red names. */
const plum = "#1f1424";
const shadow = "#3b2e3f";
const stone = "#746678";
const cream = "#f4ead2";
const red = "#cb4a50";
const yellow = "#f1c766";
const orange = "#e28649";
const leaf = "#93be64";
const sky = "#7ab2d5";

const pixelFont = '"Pixeloid Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const pixelSize = "calc(9px * var(--beast-scale, 2))";
const pixelLine = "calc(12px * var(--beast-scale, 2))";

export const beast2dEditorTheme = EditorView.theme(
  {
    "&": {
      color: cream,
      backgroundColor: plum,
      fontFamily: pixelFont,
    },
    ".cm-content": {
      fontFamily: pixelFont,
      fontSize: pixelSize,
      lineHeight: pixelLine,
      caretColor: cream,
    },
    ".cm-gutters": {
      backgroundColor: plum,
      color: stone,
      border: "none",
      fontFamily: pixelFont,
      fontSize: pixelSize,
      lineHeight: pixelLine,
    },
    ".cm-activeLineGutter": {
      backgroundColor: plum,
      color: yellow,
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(244, 234, 210, 0.06)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(241, 199, 102, 0.35)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: cream,
      borderLeftWidth: "calc(6px * var(--beast-scale, 2))",
      marginLeft: "0",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: shadow,
      border: "none",
      color: cream,
      fontFamily: pixelFont,
    },
    ".cm-tooltip, .cm-tooltip-autocomplete": {
      fontFamily: pixelFont,
      fontSize: pixelSize,
      backgroundColor: shadow,
      color: cream,
      border: "calc(2px * var(--beast-scale, 2)) solid #f1c766",
      borderRadius: "0",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: yellow,
      color: plum,
    },
    ".cm-diagnostic": {
      fontFamily: pixelFont,
      fontSize: pixelSize,
    },
  },
  { dark: true },
);

export const beast2dHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: yellow },
  { tag: tags.string, color: cream },
  { tag: tags.number, color: orange },
  { tag: tags.bool, color: orange },
  { tag: tags.null, color: orange },
  { tag: tags.comment, color: stone },
  { tag: tags.function(tags.variableName), color: leaf },
  { tag: tags.definition(tags.function(tags.variableName)), color: red },
  { tag: tags.typeName, color: sky },
  { tag: tags.propertyName, color: sky },
  { tag: tags.variableName, color: cream },
  { tag: tags.operator, color: cream },
  { tag: tags.punctuation, color: stone },
]);

export const beast2dSyntax = syntaxHighlighting(beast2dHighlight);
