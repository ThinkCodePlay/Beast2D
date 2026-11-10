import {
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionSource,
} from "@codemirror/autocomplete";

export type CartParam = {
  name: string;
  /** Wrap the snippet field in quotes, as in `btn("action")`. */
  quoted?: boolean;
  optional?: boolean;
};

export type CartFunction = {
  name: string;
  params: CartParam[];
};

export const CART_FUNCTIONS: CartFunction[] = [
  { name: "cls", params: [{ name: "color" }] },
  {
    name: "rect",
    params: [{ name: "x" }, { name: "y" }, { name: "w" }, { name: "h" }, { name: "color" }],
  },
  {
    name: "rectfill",
    params: [{ name: "x" }, { name: "y" }, { name: "w" }, { name: "h" }, { name: "color" }],
  },
  {
    name: "print",
    params: [
      { name: "text", quoted: true },
      { name: "x" },
      { name: "y" },
      { name: "color" },
      { name: "scale", optional: true },
    ],
  },
  { name: "btn", params: [{ name: "action", quoted: true }] },
  { name: "btnp", params: [{ name: "action", quoted: true }] },
];

const byName = new Map(CART_FUNCTIONS.map((fn) => [fn.name, fn]));

export function cartFunction(name: string): CartFunction | undefined {
  return byName.get(name);
}

function snippetTemplate(fn: CartFunction): string {
  const args = fn.params
    .map((param) => {
      const hole = `\${${param.name}}`;
      return param.quoted ? `"${hole}"` : hole;
    })
    .join(", ");
  return `${fn.name}(${args})`;
}

function signatureDetail(fn: CartFunction): string {
  const args = fn.params
    .map((param) => (param.optional ? `${param.name}?` : param.name))
    .join(", ");
  return `${fn.name}(${args})`;
}

export const CART_HELPER_COMPLETIONS: Completion[] = CART_FUNCTIONS.map((fn) =>
  snippetCompletion(snippetTemplate(fn), {
    label: fn.name,
    detail: signatureDetail(fn),
    type: "function",
  }),
);

export const cartHelperCompletion: CompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: CART_HELPER_COMPLETIONS,
  };
};
