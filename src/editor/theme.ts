import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Beast2D16 } from "../core/ui/palette";

function paletteCss(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, "0")}`;
}

const plum = paletteCss(Beast2D16.PlumOutline);
const shadow = paletteCss(Beast2D16.Shadow);
const stone = paletteCss(Beast2D16.StoneGray);
const cream = paletteCss(Beast2D16.Cream);
const yellow = paletteCss(Beast2D16.Yellow);
const orange = paletteCss(Beast2D16.Orange);
const leaf = paletteCss(Beast2D16.LeafGreen);
const hotPink = paletteCss(Beast2D16.HotPink);
const sky = paletteCss(Beast2D16.SkyBlue);

const consoleFont = '"Monogram", ui-monospace, monospace';
const fontSize = "calc(16px * var(--beast-scale, 2))";
const lineHeight = "calc(16px * var(--beast-scale, 2))";

export const beast2dEditorTheme = EditorView.theme(
  {
    "&": {
      color: cream,
      backgroundColor: plum,
      fontFamily: consoleFont,
    },
    ".cm-content": {
      fontFamily: consoleFont,
      fontSize,
      lineHeight,
      caretColor: hotPink,
    },
    ".cm-gutters": {
      backgroundColor: plum,
      color: stone,
      border: "none",
      fontFamily: consoleFont,
      fontSize,
      lineHeight,
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
      borderLeftColor: hotPink,
      borderLeftWidth: "calc(6px * var(--beast-scale, 2))",
      marginLeft: "0",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: shadow,
      border: "none",
      color: cream,
      fontFamily: consoleFont,
    },
    ".cm-tooltip, .cm-tooltip-autocomplete": {
      fontFamily: consoleFont,
      fontSize,
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
      fontFamily: consoleFont,
      fontSize,
    },
  },
  { dark: true },
);

export const beast2dHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: hotPink },
  { tag: tags.string, color: leaf },
  { tag: tags.number, color: orange },
  { tag: tags.bool, color: orange },
  { tag: tags.null, color: orange },
  { tag: tags.comment, color: stone },
  { tag: tags.function(tags.variableName), color: hotPink },
  { tag: tags.definition(tags.function(tags.variableName)), color: hotPink },
  { tag: tags.typeName, color: sky },
  { tag: tags.propertyName, color: sky },
  { tag: tags.variableName, color: cream },
  { tag: tags.operator, color: cream },
  { tag: tags.punctuation, color: stone },
]);

export const beast2dSyntax = syntaxHighlighting(beast2dHighlight);
