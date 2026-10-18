import type { FederatedPointerEvent } from "pixi.js";
import { Component } from "../Component";

export interface InteractiveOptions {
  onClick?: (event: FederatedPointerEvent) => void;
  onHoverStart?: (event: FederatedPointerEvent) => void;
  onHoverEnd?: (event: FederatedPointerEvent) => void;
  cursor?: string;
}

/** Makes a GameObject react to pointer click and hover (hit area = its graphics). */
export class InteractiveComponent extends Component {
  private readonly options: InteractiveOptions;

  constructor(options: InteractiveOptions = {}) {
    super();
    this.options = options;
  }

  override onInit(): void {
    const container = this.gameObject?.container;
    if (!container) return;

    container.eventMode = "static";
    if (this.options.cursor) container.cursor = this.options.cursor;
    container.on("pointertap", this.onTap);
    container.on("pointerover", this.onOver);
    container.on("pointerout", this.onOut);
  }

  override onDestroy(): void {
    const container = this.gameObject?.container;
    if (!container || container.destroyed) return;

    container.off("pointertap", this.onTap);
    container.off("pointerover", this.onOver);
    container.off("pointerout", this.onOut);
  }

  private onTap = (event: FederatedPointerEvent) => {
    if (this.enabled) this.options.onClick?.(event);
  };
  private onOver = (event: FederatedPointerEvent) => {
    if (this.enabled) this.options.onHoverStart?.(event);
  };
  private onOut = (event: FederatedPointerEvent) => {
    if (this.enabled) this.options.onHoverEnd?.(event);
  };
}
