import { DISPLAY_HEIGHT, DISPLAY_WIDTH, PIXEL_GRID } from "../../core/consts";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { HudHeaderUI } from "../../core/components/UI/HudHeaderUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";
import { Beast2D16 } from "../../core/palette/beast2d16";
import { useBitmapFont } from "../../core/ui/bitmapFontRegistry";
import {
  preloadBitmapFont,
  resetBitmapTextAtlas,
} from "../../core/ui/BitmapText";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../../core/ui/defaultBitmapFont";
import {
  DEFAULT_BEAST2D_DIALOG_THEME,
  DEFAULT_BEAST2D_HUD_THEME,
} from "../../core/ui/defaultUiTheme";
import { BreakoutPlayfieldHint } from "./BreakoutPlayfieldHint";
import { START_LIVES } from "./breakoutLogic";

export function registerBreakoutUiFont(): void {
  useBitmapFont(DEFAULT_BEAST2D_BITMAP_FONT);
  resetBitmapTextAtlas();
  void preloadBitmapFont();
}

export function spawnBreakoutHud(lives: number): HudHeaderUI {
  const hud = new HudHeaderUI(0, lives, DEFAULT_BEAST2D_HUD_THEME);
  ScoreUI.resetScore(0);
  return hud;
}

export function spawnBreakoutHint(message: string): BreakoutPlayfieldHint {
  return new BreakoutPlayfieldHint(message);
}

export function spawnBreakoutDialog(onRestart: () => void): DialogUI {
  const dialogWidth = DISPLAY_WIDTH - PIXEL_GRID * 2;
  const dialogHeight = PIXEL_GRID * 6;
  const dialog = new DialogUI(
    PIXEL_GRID,
    (DISPLAY_HEIGHT - dialogHeight) / 2,
    dialogWidth,
    dialogHeight,
    "",
    0,
    false,
    DEFAULT_BEAST2D_DIALOG_THEME,
    {
      color: Beast2D16.Shadow,
      strokeColor: Beast2D16.Magenta,
    },
  );
  DialogUI.setOnRestart(onRestart);
  return dialog;
}

export { START_LIVES };
