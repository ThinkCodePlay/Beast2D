import { HUD_CONTRACT, hudScoreMaxWidth } from "./hudContract";
import { measureBitmapText } from "./BitmapText";

const textOpts = () => ({
  scale: HUD_CONTRACT.fontScale,
  letterSpacing: HUD_CONTRACT.fontLetterSpacing,
});

/**
 * HUD score line at integer font scale only. Truncates with `+` suffix when too wide.
 */
export function formatHudScoreLine(
  score: number,
  lives: number = HUD_CONTRACT.defaultLives,
): string {
  const label = HUD_CONTRACT.scoreLabel;
  const maxW = hudScoreMaxWidth(lives);
  const value = Math.max(0, Math.floor(score));
  let line = `${label} ${value}`;

  if (measureBitmapText(line, textOpts()) <= maxW) {
    return line;
  }

  let digits = String(value);
  while (digits.length > 1) {
    digits = digits.slice(0, -1);
    line = `${label} ${digits}+`;
    if (measureBitmapText(line, textOpts()) <= maxW) {
      return line;
    }
  }

  return `${label} 0`;
}
