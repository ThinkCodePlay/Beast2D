import { TEXTURE_HEART } from "../../game/publicAssets";
import { Beast2D16 } from "../palette/beast2d16";
import type { DialogChromeTheme } from "./dialogTheme";
import type { HudHeaderTheme } from "./hudTheme";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "./defaultBitmapFont";

export const TEXTURE_DEFAULT_HUD_BAND = "ui/hud-band.320x16.png";

/** Default Beast2D HUD chrome for non-shooter demos (Breakout, etc.). */
export const TEXTURE_DEFAULT_DIALOG_PANEL = "ui/panel-9slice.24x24.png";
export const TEXTURE_DEFAULT_DIALOG_BUTTON = "ui/button.48x16.png";

export const DEFAULT_BEAST2D_DIALOG_THEME: DialogChromeTheme = {
  panelTexture: TEXTURE_DEFAULT_DIALOG_PANEL,
  buttonTexture: TEXTURE_DEFAULT_DIALOG_BUTTON,
};

export const DEFAULT_BEAST2D_HUD_THEME: HudHeaderTheme = {
  bandTexture: TEXTURE_DEFAULT_HUD_BAND,
  heartTexture: TEXTURE_HEART,
  fontTint: Beast2D16.Cream,
  fontScale: 1,
  fontLetterSpacing: 1,
  bitmapFont: {
    glyphW: DEFAULT_BEAST2D_BITMAP_FONT.glyphW,
    glyphH: DEFAULT_BEAST2D_BITMAP_FONT.glyphH,
  },
};
