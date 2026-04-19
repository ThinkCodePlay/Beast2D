import { Graphics, Text, TextStyle } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";

export class DialogUIRenderComponent extends RenderComponent {
  private width: number;
  private height: number;
  private borderRadius: number;
  private message: string;
  private score: number;
  private isOpen: boolean;
  private messageTextNode: Text | null = null;
  private scoreTextNode: Text | null = null;
  private restartButtonNode: Graphics | null = null;
  private restartButtonTextNode: Text | null = null;
  private onRestart: (() => void) | null = null;
  private onPause: (() => void) | null = null;
  private onResume: (() => void) | null = null;

  constructor(
    width: number = 320,
    height: number = 140,
    message: string = "Game Over",
    score: number = 0,
    isOpen: boolean = false,
    renderOptions: RenderOptions = {},
  ) {
    super({
      color: 0x101522,
      strokeColor: 0xffffff,
      strokeWidth: 2,
      alpha: 0.92,
      ...renderOptions,
    });

    this.width = width;
    this.height = height;
    this.borderRadius = 14;
    this.message = message;
    this.score = score;
    this.isOpen = isOpen;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.redraw(graphics);
    return graphics;
  }

  open(message?: string, score?: number): void {
    if (message !== undefined) {
      this.message = message;
    }
    if (score !== undefined) {
      this.score = Math.max(0, score);
    }
    this.isOpen = true;
    this.onPause?.();
    this.refresh();
  }

  close(): void {
    this.isOpen = false;
    this.onResume?.();
    this.refresh();
  }

  getOpenState(): boolean {
    return this.isOpen;
  }

  setOnRestart(handler: (() => void) | null): void {
    this.onRestart = handler;
  }

  setOnPause(handler: (() => void) | null): void {
    this.onPause = handler;
  }

  setOnResume(handler: (() => void) | null): void {
    this.onResume = handler;
  }

  private refresh(): void {
    if (!this.graphics || !(this.graphics instanceof Graphics)) return;

    this.destroyDynamicNodes(this.graphics);

    this.graphics.clear();
    this.redraw(this.graphics);
  }

  private redraw(graphics: Graphics): void {
    if (!this.isOpen) {
      graphics.visible = false;
      return;
    }

    graphics.visible = true;
    graphics
      .roundRect(0, 0, this.width, this.height, this.borderRadius)
      .fill({
        color: this.renderOptions.color,
        alpha: this.renderOptions.alpha,
      })
      .stroke({
        color: this.renderOptions.strokeColor,
        width: this.renderOptions.strokeWidth,
      });

    this.messageTextNode = new Text({
      text: this.message,
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 34,
        fontWeight: "700",
        align: "center",
      }),
    });

    this.messageTextNode.anchor.set(0.5);
    this.messageTextNode.x = this.width / 2;
    this.messageTextNode.y = this.height * 0.32;
    graphics.addChild(this.messageTextNode);

    this.scoreTextNode = new Text({
      text: `Score: ${this.score}`,
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: "600",
        align: "center",
      }),
    });

    this.scoreTextNode.anchor.set(0.5);
    this.scoreTextNode.x = this.width / 2;
    this.scoreTextNode.y = this.height * 0.56;
    graphics.addChild(this.scoreTextNode);

    const buttonWidth = this.width * 0.55;
    const buttonHeight = 42;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = this.height - buttonHeight - 14;

    this.restartButtonNode = new Graphics()
      .roundRect(0, 0, buttonWidth, buttonHeight, 10)
      .fill({ color: 0x2f7dff })
      .stroke({ color: 0xffffff, width: 1 });
    this.restartButtonNode.x = buttonX;
    this.restartButtonNode.y = buttonY;
    this.restartButtonNode.eventMode = "static";
    this.restartButtonNode.cursor = "pointer";
    this.restartButtonNode.on("pointertap", () => {
      this.onRestart?.();
    });

    this.restartButtonTextNode = new Text({
      text: "Restart",
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 22,
        fontWeight: "700",
      }),
    });

    this.restartButtonTextNode.anchor.set(0.5);
    this.restartButtonTextNode.x = buttonWidth / 2;
    this.restartButtonTextNode.y = buttonHeight / 2;
    this.restartButtonNode.addChild(this.restartButtonTextNode);
    graphics.addChild(this.restartButtonNode);
  }

  private destroyDynamicNodes(graphics: Graphics): void {
    if (this.messageTextNode && this.messageTextNode.parent === graphics) {
      graphics.removeChild(this.messageTextNode);
      this.messageTextNode.destroy();
      this.messageTextNode = null;
    }

    if (this.scoreTextNode && this.scoreTextNode.parent === graphics) {
      graphics.removeChild(this.scoreTextNode);
      this.scoreTextNode.destroy();
      this.scoreTextNode = null;
    }

    if (this.restartButtonTextNode && this.restartButtonNode) {
      this.restartButtonNode.removeChild(this.restartButtonTextNode);
      this.restartButtonTextNode.destroy();
      this.restartButtonTextNode = null;
    }

    if (this.restartButtonNode && this.restartButtonNode.parent === graphics) {
      this.restartButtonNode.removeAllListeners();
      graphics.removeChild(this.restartButtonNode);
      this.restartButtonNode.destroy();
      this.restartButtonNode = null;
    }
  }

  override destroy(): void {
    if (this.graphics && this.graphics instanceof Graphics) {
      this.destroyDynamicNodes(this.graphics);
    }
    super.destroy();
  }
}
