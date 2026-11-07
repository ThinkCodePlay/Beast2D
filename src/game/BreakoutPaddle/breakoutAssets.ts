import { TEXTURE_HEART } from "../publicAssets";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../../core/ui/defaultBitmapFont";
import {
  TEXTURE_DEFAULT_DIALOG_BUTTON,
  TEXTURE_DEFAULT_DIALOG_PANEL,
  TEXTURE_DEFAULT_HUD_BAND,
} from "../../core/ui/defaultUiTheme";

/** Preload list for {@link BreakoutPaddle}. */
export const BREAKOUT_ASSETS = [
  TEXTURE_HEART,
  TEXTURE_DEFAULT_HUD_BAND,
  TEXTURE_DEFAULT_DIALOG_PANEL,
  TEXTURE_DEFAULT_DIALOG_BUTTON,
  DEFAULT_BEAST2D_BITMAP_FONT.atlasPath,
] as const;
