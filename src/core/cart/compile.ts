import { transform } from "sucrase";
import { BEAST_EMOJI } from "../ui/beastEmoji";
import { btn, btnp, cls, print, rect, rectfill } from "./api";
import type { Cart } from "./Cart";

export type CompileFailure = { ok: false; message: string; line?: number };
export type CompileSuccess = { ok: true; cart: Cart };
export type CompileResult = CompileSuccess | CompileFailure;

// `beast` is the approved 8×8 mascot glyph (public/ui/mascot-emoji-8.png), one character.
const helperNames = ["cls", "rect", "rectfill", "print", "btn", "btnp", "beast"] as const;

/** V8 reports `new Function(body)` stack lines ahead of the matching `body` line. */
function measureRuntimeLineOffset(): number {
  try {
    const probe = new Function("throw new Error('beast2d-cart-line-probe');");
    probe();
  } catch (error) {
    if (error instanceof Error && error.stack) {
      const match = /<anonymous>:(\d+):\d+/.exec(error.stack);
      if (match) {
        const reported = Number(match[1]);
        if (reported >= 1) return reported - 1;
      }
    }
  }
  return 2;
}

export const CART_RUNTIME_LINE_OFFSET = measureRuntimeLineOffset();

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Best-effort 1-based line from Sucrase / syntax errors. */
export function syntaxErrorLine(message: string): number | undefined {
  const paren = message.match(/\((\d+):\d+\)/);
  if (paren) return Number(paren[1]);
  const labeled = message.match(/line (\d+)/i);
  if (labeled) return Number(labeled[1]);
  return undefined;
}

export function checkCartSyntax(source: string): CompileFailure | { ok: true } {
  try {
    transform(source, { transforms: ["typescript"] });
    return { ok: true };
  } catch (error) {
    const message = errorMessage(error);
    return { ok: false, message, line: syntaxErrorLine(message) };
  }
}

function requireCartPhase(value: unknown, name: string): CompileFailure | (() => void) {
  if (typeof value !== "function") {
    return { ok: false, message: `Cart must define ${name}()` };
  }
  return value as () => void;
}

function isCompileFailure(value: unknown): value is CompileFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    (value as CompileFailure).ok === false
  );
}

function cartFunctionBody(js: string): string {
  return `${js}\nreturn { init, update, draw };`;
}

export function compileCart(source: string): CompileResult {
  const syntax = checkCartSyntax(source);
  if (!syntax.ok) return syntax;

  try {
    const js = transform(source, { transforms: ["typescript"] }).code;
    const body = cartFunctionBody(js);
    const runner = new Function(...helperNames, body) as (
      clsFn: typeof cls,
      rectFn: typeof rect,
      rectfillFn: typeof rectfill,
      printFn: typeof print,
      btnFn: typeof btn,
      btnpFn: typeof btnp,
      beastGlyph: string,
    ) => { init: unknown; update: unknown; draw: unknown };

    const phases = runner(cls, rect, rectfill, print, btn, btnp, BEAST_EMOJI);
    const initFn = requireCartPhase(phases.init, "init");
    if (isCompileFailure(initFn)) return initFn;
    const updateFn = requireCartPhase(phases.update, "update");
    if (isCompileFailure(updateFn)) return updateFn;
    const drawFn = requireCartPhase(phases.draw, "draw");
    if (isCompileFailure(drawFn)) return drawFn;

    const cart: Cart = {
      init: initFn as Cart["init"],
      update: updateFn as Cart["update"],
      draw: drawFn as Cart["draw"],
    };
    return { ok: true, cart };
  } catch (error) {
    const message = errorMessage(error);
    return { ok: false, message, line: syntaxErrorLine(message) };
  }
}

/** Maps a V8 `<anonymous>:line:col` stack frame to a 1-based script line. */
export function runtimeErrorLine(error: unknown): number | undefined {
  if (!(error instanceof Error) || !error.stack) return undefined;
  const match = /<anonymous>:(\d+):\d+/.exec(error.stack);
  if (!match) return undefined;
  const line = Number(match[1]) - CART_RUNTIME_LINE_OFFSET;
  return line >= 1 ? line : undefined;
}

export function guardCart(
  cart: Cart,
  onRuntimeError: (message: string, line?: number) => void,
): Cart {
  let lastReportKey: string | null = null;

  const report = (phase: string, error: unknown) => {
    const message = errorMessage(error);
    const line = runtimeErrorLine(error);
    const key = `${phase}\0${line ?? 0}\0${message}`;
    if (key === lastReportKey) return;
    lastReportKey = key;
    onRuntimeError(message, line);
  };

  const run = (phase: string, fn: () => void) => {
    try {
      fn();
    } catch (error) {
      report(phase, error);
      throw error;
    }
  };

  return {
    init() {
      lastReportKey = null;
      run("init", () => cart.init());
    },
    update(dt) {
      run("update", () => cart.update(dt));
    },
    draw() {
      run("draw", () => cart.draw());
    },
  };
}
