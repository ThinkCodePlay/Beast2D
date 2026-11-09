import type { Container, FederatedPointerEvent } from "pixi.js";

export type UiButtonActivateHandler = () => void;

export interface WireUiPointerButtonOptions {
  onActivate: UiButtonActivateHandler;
  cursor?: string;
}

/**
 * Shared dialog/HUD primary control: one `pointertap` (mouse or touch),
 * propagation stopped so gameplay pointer steering does not run underneath.
 */
export function wireUiPointerButton(
  display: Container,
  options: WireUiPointerButtonOptions,
): () => void {
  display.eventMode = "static";
  display.cursor = options.cursor ?? "pointer";

  const onTap = (event: FederatedPointerEvent) => {
    event.stopPropagation();
    options.onActivate();
  };

  display.on("pointertap", onTap);

  return () => {
    display.off("pointertap", onTap);
  };
}
