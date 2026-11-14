export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function pressable(button: HTMLButtonElement): void {
  button.addEventListener("pointerdown", () => {
    if (button.disabled) return;
    button.classList.add("is-down");
  });
  const clear = () => button.classList.remove("is-down");
  button.addEventListener("pointerup", clear);
  button.addEventListener("pointerleave", clear);
}

/** Matches `paintSfxKnob`: `rotate(-140 + value * 280deg)` with 12 o'clock = 0.5. */
const KNOB_ANGLE_MIN = -140;
const KNOB_ANGLE_MAX = 140;
const KNOB_ANGLE_SPAN = KNOB_ANGLE_MAX - KNOB_ANGLE_MIN;

export function knobValueFromPointer(button: HTMLElement, clientX: number, clientY: number): number | null {
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  if (dx === 0 && dy === 0) return null;
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  deg = Math.min(KNOB_ANGLE_MAX, Math.max(KNOB_ANGLE_MIN, deg));
  return (deg - KNOB_ANGLE_MIN) / KNOB_ANGLE_SPAN;
}

export function knobStepFromPointer(button: HTMLElement, clientX: number, clientY: number): number | null {
  const next = knobValueFromPointer(button, clientX, clientY);
  if (next === null) return null;
  return Math.round(next * 255);
}