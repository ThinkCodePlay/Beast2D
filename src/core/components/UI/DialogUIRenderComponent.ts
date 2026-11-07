import { Container, Graphics } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { Beast2D16 } from "../../palette/beast2d16";
import { buildBitmapText } from "../../ui/BitmapText";
import { NineSliceSprite } from "../../ui/NineSliceSprite";
import {
  DISPLAY_WIDTH,
  TEXTURE_SHOOTER_BUTTON,
  TEXTURE_SHOOTER_PANEL,
} from "../../consts";

export class DialogUIRenderComponent extends RenderComponent {
  private width: number;
  private height: number;
  private message: string;
  private score: number;
  private isOpen: boolean;
  private primaryLabel = "RESTART";
  private panelHost: Container | null = null;
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
      color: Beast2D16.Shadow,
      strokeColor: Beast2D16.Magenta,
      strokeWidth: 1,
      alpha: 1,
      ...renderOptions,
    });

    this.width = width;
    this.height = height;
    this.message = message;
    this.score = score;
    this.isOpen = isOpen;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    this.redraw(graphics);
    return graphics;
  }

  setPrimaryLabel(label: string): void {
    this.primaryLabel = label;
    this.refresh();
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

    if (this.score > 0 || this.message.toUpperCase().includes("OVER")) {
      graphics
        .rect(0, 0, DISPLAY_WIDTH, 240)
        .fill({ color: Beast2D16.PlumOutline, alpha: 0.55 });
    }

    this.panelHost = new Container();
    this.panelHost.x = 0;
    this.panelHost.y = 0;
    graphics.addChild(this.panelHost);

    const panel = new NineSliceSprite({
      texturePath: `/${TEXTURE_SHOOTER_PANEL}`,
      width: this.width,
      height: this.height,
      slice: 8,
    });
    this.panelHost.addChild(panel);

    const title = buildBitmapText(this.message, {
      scale: 2,
      tint: Beast2D16.HotPink,
      letterSpacing: 1,
    });
    title.x = Math.floor((this.width - this.message.length * 12) / 2);
    title.y = 12;
    this.panelHost.addChild(title);

    if (this.score > 0) {
      const scoreLine = buildBitmapText(`SCORE ${this.score}`, {
        scale: 1,
        tint: Beast2D16.Cream,
      });
      scoreLine.x = Math.floor((this.width - (`SCORE ${this.score}`).length * 7) / 2);
      scoreLine.y = 40;
      this.panelHost.addChild(scoreLine);
    }

    const btnW = 72;
    const btnH = 16;
    const btnX = (this.width - btnW) / 2;
    const btnY = this.height - btnH - 12;

    const btn = new NineSliceSprite({
      texturePath: `/${TEXTURE_SHOOTER_BUTTON}`,
      width: btnW,
      height: btnH,
      slice: 4,
    });
    btn.x = btnX;
    btn.y = btnY;
    btn.eventMode = "static";
    btn.cursor = "pointer";
    btn.on("pointertap", () => {
      this.onRestart?.();
    });
    this.panelHost.addChild(btn);

    const btnLabel = buildBitmapText(this.primaryLabel, {
      scale: 1,
      tint: Beast2D16.Cream,
    });
    btnLabel.x = btnX + Math.floor((btnW - this.primaryLabel.length * 7) / 2);
    btnLabel.y = btnY + 4;
    this.panelHost.addChild(btnLabel);
  }

  private destroyDynamicNodes(graphics: Graphics): void {
    if (this.panelHost && this.panelHost.parent === graphics) {
      this.panelHost.removeAllListeners();
      graphics.removeChild(this.panelHost);
      this.panelHost.destroy({ children: true });
      this.panelHost = null;
    }
  }

  override onDestroy(): void {
    if (this.graphics && this.graphics instanceof Graphics) {
      this.destroyDynamicNodes(this.graphics);
    }
    super.onDestroy();
  }
}
