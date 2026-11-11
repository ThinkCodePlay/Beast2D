import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Beast2D16 } from "../core/ui/palette";
import { beastColorHex } from "./chromeColors";

const plum = beastColorHex(Beast2D16.PlumOutline);
const shadow = beastColorHex(Beast2D16.Shadow);
const stone = beastColorHex(Beast2D16.StoneGray);
const cream = beastColorHex(Beast2D16.Cream);
const hotPink = beastColorHex(Beast2D16.HotPink);
const yellow = beastColorHex(Beast2D16.Yellow);
const orange = beastColorHex(Beast2D16.Orange);
const leaf = beastColorHex(Beast2D16.LeafGreen);
const sky = beastColorHex(Beast2D16.SkyBlue);
const lightPink = beastColorHex(Beast2D16.LightPink);

const codeFont =
  'var(--beast-code-font, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)';

export const beast2dEditorTheme = EditorView.theme(
  {
    "&": {
      color: cream,
      backgroundColor: plum,
      fontFamily: codeFont,
      fontSize: "13px",
      lineHeight: "1.55",
    },
    ".cm-content": {
      fontFamily: codeFont,
      caretColor: hotPink,
      padding: "12px 0",
    },
    ".cm-gutters": {
      backgroundColor: plum,
      color: stone,
      border: "none",
      fontFamily: codeFont,
      opacity: "0.65",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "color-mix(in srgb, var(--beast-shadow) 55%, transparent)",
      color: stone,
    },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--beast-cream) 6%, transparent)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "color-mix(in srgb, var(--beast-hot-pink) 35%, transparent)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: hotPink,
      borderLeftWidth: "2px",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: shadow,
      border: "none",
      color: cream,
    },
    ".cm-foldGutter .cm-gutterElement": {
      color: stone,
      cursor: "pointer",
    },
    ".cm-foldGutter .cm-gutterElement:hover": {
      color: cream,
    },
    ".cm-tooltip, .cm-tooltip-autocomplete": {
      fontFamily: codeFont,
      fontSize: "13px",
      backgroundColor: shadow,
      color: cream,
      border: "1px solid var(--beast-stone)",
      borderRadius: "8px",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: hotPink,
      color: plum,
    },
    ".cm-diagnostic": {
      fontFamily: codeFont,
      fontSize: "12px",
    },
    ".cm-lintRange-error": {
      backgroundImage: "none",
      borderBottom: `2px solid ${hotPink}`,
    },
    ".cm-gutter-lint": {
      width: "1.1em",
    },
    ".cm-gutter-lint .cm-lintMarker-error": {
      color: hotPink,
    },
    ".cm-scroller": {
      scrollbarWidth: "thin",
      scrollbarColor: "var(--beast-stone) transparent",
    },
    ".cm-scroller::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      background: "var(--beast-stone)",
      borderRadius: "4px",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:active": {
      background: "var(--beast-hot-pink)",
    },
  },
  { dark: true },
);

export const beast2dHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: yellow },
  { tag: tags.string, color: leaf },
  { tag: tags.number, color: orange },
  { tag: tags.bool, color: orange },
  { tag: tags.null, color: orange },
  { tag: tags.comment, color: stone },
  { tag: tags.function(tags.variableName), color: lightPink },
  { tag: tags.definition(tags.function(tags.variableName)), color: lightPink },
  { tag: tags.typeName, color: sky },
  { tag: tags.propertyName, color: sky },
  { tag: tags.variableName, color: cream },
  { tag: tags.operator, color: cream },
  { tag: tags.punctuation, color: stone },
]);

export const beast2dSyntax = syntaxHighlighting(beast2dHighlight);
