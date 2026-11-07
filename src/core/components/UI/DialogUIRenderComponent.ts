import { Container, Graphics } from "pixi.js";
import { RenderComponent } from "../Render/RenderComponent";
import type { RenderOptions } from "../Render/RenderComponent";
import { Beast2D16 } from "../../palette/beast2d16";
import {
  buildBitmapTextReady,
  measureBitmapText,
  preloadBitmapFont,
} from "../../ui/BitmapText";
import type { DialogChromeTheme } from "../../ui/dialogTheme";
import { NineSliceSprite } from "../../ui/NineSliceSprite";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../consts";

export class DialogUIRenderComponent extends RenderComponent {
  private width: number;
  private height: number;
  private message: string;
  private score: number;
  private isOpen: boolean;
  private readonly chrome: DialogChromeTheme;
  private primaryLabel = "RESTART";
  private panelHost: Container | null = null;
  private redrawToken = 0;
  private onRestart: (() => void) | null = null;
  private onPause: (() => void) | null = null;
  private onResume: (() => void) | null = null;

  constructor(
    width: number = 320,
    height: number = 140,
    message: string = "Game Over",
    score: number = 0,
    isOpen: boolean = false,
    chrome: DialogChromeTheme,
    renderOptions: RenderOptions = {},
  ) {
    super({
      color: Beast2D16.Shadow,
      strokeColor: Beast2D16.Magenta,
      strokeWidth: 1,
      alpha: 1,
      ...renderOptions,
    });

    this.width = Math.round(width / 8) * 8;
    this.height = Math.round(height / 8) * 8;
    this.message = message;
    this.score = score;
    this.isOpen = isOpen;
    this.chrome = chrome;
  }

  createGraphics(): Graphics {
    const graphics = new Graphics();
    void this.paint(graphics);
    return graphics;
  }

  setPrimaryLabel(label: string): void {
    this.primaryLabel = label;
    this.refresh();
  }

  open(message?: string, score?: number): void {
    if (message !== undefined) this.message = message;
    if (score !== undefined) this.score = Math.max(0, score);
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
    void this.paint(this.graphics);
  }

  private async paint(graphics: Graphics): Promise<void> {
    const token = ++this.redrawToken;
    if (!this.isOpen) {
      graphics.visible = false;
      return;
    }

    await preloadBitmapFont();
    if (token !== this.redrawToken || graphics.destroyed) return;

    graphics.visible = true;
    graphics.clear();

    if (this.score > 0 || this.message.toUpperCase().includes("OVER")) {
      for (let y = 0; y < DISPLAY_HEIGHT; y += 8) {
        for (let x = 0; x < DISPLAY_WIDTH; x += 8) {
          graphics
            .rect(x, y, 8, 8)
            .fill({ color: Beast2D16.PlumOutline, alpha: 0.72 });
        }
      }
    }

    this.panelHost = new Container();
    graphics.addChild(this.panelHost);

    const panel = new NineSliceSprite({
      texturePath: this.chrome.panelTexture,
      width: this.width,
      height: this.height,
      slice: 8,
    });
    this.panelHost.addChild(panel);

    const titleOpts = { scale: 2, tint: Beast2D16.HotPink, letterSpacing: 1 };
    const title = await buildBitmapTextReady(this.message, titleOpts);
    title.x = Math.round(
      (this.width - measureBitmapText(this.message, titleOpts)) / 2,
    );
    title.y = 16;
    this.panelHost.addChild(title);

    if (this.score > 0) {
      const scoreText = `SCORE ${this.score}`;
      const scoreOpts = { scale: 1, tint: Beast2D16.Cream, letterSpacing: 1 };
      const scoreLine = await buildBitmapTextReady(scoreText, scoreOpts);
      scoreLine.x = Math.round(
        (this.width - measureBitmapText(scoreText, scoreOpts)) / 2,
      );
      scoreLine.y = 44;
      this.panelHost.addChild(scoreLine);
    }

    const btnW = 80;
    const btnH = 16;
    const btnX = Math.round((this.width - btnW) / 2);
    const btnY = this.height - btnH - 16;

    const btn = new NineSliceSprite({
      texturePath: this.chrome.buttonTexture,
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

    const labelOpts = { scale: 1, tint: Beast2D16.Cream, letterSpacing: 1 };
    const btnLabel = await buildBitmapTextReady(this.primaryLabel, labelOpts);
    btnLabel.x =
      btnX +
      Math.round((btnW - measureBitmapText(this.primaryLabel, labelOpts)) / 2);
    btnLabel.y = btnY + 4;
    this.panelHost.addChild(btnLabel);
  }

  private destroyDynamicNodes(graphics: Graphics): void {
    if (this.panelHost && this.panelHost.parent === graphics) {
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
