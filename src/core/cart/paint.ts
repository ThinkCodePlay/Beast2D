import { Assets, Container, Graphics, type Texture } from "pixi.js";
import { buildBitmapTextFromSheet } from "../ui/BitmapText";
import { tryGetBitmapFont } from "../ui/bitmapFontRegistry";
import type { DrawList } from "./commands";
import { paletteIndex } from "./paletteIndex";

function tryFontSheet(): Texture | null {
  const font = tryGetBitmapFont();
  if (!font) return null;
  try {
    const sheet = Assets.get<Texture>(font.atlasPath);
    return sheet ?? null;
  } catch {
    return null;
  }
}

/** Paints a draw list into `layer`, replacing whatever was there last frame. */
export function paintDrawList(
  layer: Container,
  list: DrawList,
  width: number,
  height: number,
): void {
  for (const child of layer.removeChildren()) {
    child.destroy({ children: true });
  }

  const sheet = tryFontSheet();

  for (const command of list.commands) {
    if (command.op === "cls") {
      layer.addChild(
        new Graphics().rect(0, 0, width, height).fill({ color: paletteIndex(command.color) }),
      );
      continue;
    }
    if (command.op === "rectfill") {
      layer.addChild(
        new Graphics()
          .rect(command.x, command.y, command.w, command.h)
          .fill({ color: paletteIndex(command.color) }),
      );
      continue;
    }
    if (command.op === "rect") {
      layer.addChild(
        new Graphics().rect(command.x, command.y, command.w, command.h).stroke({
          width: 1,
          color: paletteIndex(command.color),
          alignment: 1,
        }),
      );
      continue;
    }
    if (!sheet) continue;
    const text = buildBitmapTextFromSheet(sheet, command.text, {
      scale: command.scale,
      tint: paletteIndex(command.color),
    });
    text.x = Math.round(command.x);
    text.y = Math.round(command.y);
    layer.addChild(text);
  }
}
