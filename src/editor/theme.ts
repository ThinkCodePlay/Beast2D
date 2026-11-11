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
const magenta = paletteCss(Beast2D16.Magenta);
const yellow = paletteCss(Beast2D16.Yellow);
const orange = paletteCss(Beast2D16.Orange);
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
