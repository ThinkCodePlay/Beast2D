import type { Input } from "../Input";
import type { DrawList } from "./commands";

export interface CartContext {
  drawList: DrawList;
  input: Input;
}

let current: CartContext | null = null;

/** Runs `fn` with cart helpers bound to this draw list and input. */
export function withCartContext<T>(context: CartContext, fn: () => T): T {
  const previous = current;
  current = context;
  try {
    return fn();
  } finally {
    current = previous;
  }
}

export function requireCartContext(fn: string): CartContext {
  if (!current) {
    throw new Error(`${fn}() only works while a cart is running`);
  }
  return current;
}
