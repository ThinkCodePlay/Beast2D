import { Beast2D16 } from "../../core/palette/beast2d16";
import type { DialogChromeTheme } from "../../core/ui/dialogTheme";
import type { HudHeaderTheme } from "../../core/ui/hudTheme";
import {
  TEXTURE_SHOOTER_BUTTON,
  TEXTURE_SHOOTER_HUD,
  TEXTURE_SHOOTER_PANEL,
} from "./shooterAssets";
import { SHOOTER_BITMAP_FONT } from "./shooterBitmapFont";

export const SHOOTER_HUD_THEME: HudHeaderTheme = {
  bandTexture: TEXTURE_SHOOTER_HUD,
  fontTint: Beast2D16.Cream,
  bitmapFont: {
    glyphW: SHOOTER_BITMAP_FONT.glyphW,
    glyphH: SHOOTER_BITMAP_FONT.glyphH,
  },
};

export const SHOOTER_DIALOG_THEME: DialogChromeTheme = {
  panelTexture: TEXTURE_SHOOTER_PANEL,
  buttonTexture: TEXTURE_SHOOTER_BUTTON,
};
