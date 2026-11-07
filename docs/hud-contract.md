# Compact HUD contract (320×16)

Arcade demos that show **lives** and **score** should keep both inside the top **320×16** strip (`HUD_HEIGHT` in `src/core/ui/hudLayout.ts`):

| Slot | Anchor | Style |
|------|--------|--------|
| Lives | Left, `HUD_PADDING` (4px) | Hot pink bitmap label (`HudLivesUI`) |
| Score | Right, `DISPLAY_WIDTH - HUD_PADDING` | Cream bitmap label (`ScoreUI.forHudTop`) |
| Chrome | Full-width band | `HudBand` (`Beast2D16.Shadow` fill) |

**Playfield prompts** (serve, restart hints) use `PlayfieldHintUI` centered just below the HUD (`y = 18`), not inside the header.

## Bitmap font

HUD text uses `public/ui/font-atlas.5x7.png` and `src/core/ui/BitmapText.ts`. The same atlas ships on PR #8 under `space-shooter/ui/`; this branch uses a **shared** `public/ui/` copy until those paths are merged. Do not duplicate a second font framework.

## Space Shooter / PR #8

This PR updates shared `ScoreUIRenderComponent` but **does not** edit `src/game/Space Shooter/`. Shooter HUD wiring and enemy art remain on PR #8. Expect a **merge conflict** on `ScoreUIRenderComponent.ts`, `BitmapText.ts`, and font paths when integrating both PRs—keep one atlas path and `forHudTop` / `ShooterHud` alignment.
