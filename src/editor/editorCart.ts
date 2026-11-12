import type { Cart } from "../core/cart/Cart";
import { compileCart, type CompileFailure } from "../core/cart/compile";

/**
 * Compile the editor buffer and load it.
 * Opening the editor after a level must start this cart, not keep the level.
 */
export async function loadEditorCart(
  source: string,
  loadCart: (cart: Cart) => Promise<void>,
): Promise<{ ok: true } | CompileFailure> {
  const result = compileCart(source);
  if (!result.ok) return result;
  await loadCart(result.cart);
  return { ok: true };
}
