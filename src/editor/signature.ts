import { EditorState, StateField } from "@codemirror/state";
import { showTooltip, type Tooltip } from "@codemirror/view";
import { cartFunction } from "./helpers";

type OpenCall = { name: string; argIndex: number };

/** The cart call whose argument list contains `pos`, if any. */
export function openCartCall(state: EditorState, pos: number): OpenCall | null {
  const from = Math.max(0, pos - 400);
  const text = state.doc.sliceString(from, pos);
  let depth = 0;
  let commas = 0;
  let quote: string | null = null;

  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === ")") {
      depth += 1;
      continue;
    }
    if (ch === "(") {
      if (depth > 0) {
        depth -= 1;
        continue;
      }
      const name = /([A-Za-z_]\w*)\s*$/.exec(text.slice(0, i))?.[1];
      if (!name || !cartFunction(name)) return null;
      return { name, argIndex: commas };
    }
    if (ch === "," && depth === 0) commas += 1;
  }
  return null;
}

function signatureTooltip(state: EditorState): Tooltip | null {
  if (!state.selection.main.empty) return null;
  const call = openCartCall(state, state.selection.main.head);
  if (!call) return null;
  const fn = cartFunction(call.name);
  if (!fn) return null;

  return {
    pos: state.selection.main.head,
    above: true,
    create() {
      const dom = document.createElement("div");
      dom.className = "beast2d-signature";
      dom.append(document.createTextNode(`${fn.name}(`));
      fn.params.forEach((param, index) => {
        if (index > 0) dom.append(document.createTextNode(", "));
        const label = param.optional ? `${param.name}?` : param.name;
        if (index === call.argIndex) {
          const active = document.createElement("span");
          active.className = "beast2d-signature-active";
          active.textContent = label;
          dom.append(active);
        } else {
          dom.append(document.createTextNode(label));
        }
      });
      dom.append(document.createTextNode(")"));
      return { dom };
    },
  };
}

export const cartSignatureHints = StateField.define<Tooltip | null>({
  create: signatureTooltip,
  update(_value, transaction) {
    if (!transaction.docChanged && !transaction.selection) return _value;
    return signatureTooltip(transaction.state);
  },
  provide: (field) => showTooltip.from(field),
});
