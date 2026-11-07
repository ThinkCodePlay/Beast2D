# HUD header integration (PR #9 ↔ PR #8)

Breakout and other non-shooter demos use the same **`HUD_CONTRACT`** and **`HudHeaderUI`** introduced on PR #8 (`cursor/space-shooter-visual-milestone-3ecb`).

| Topic | This PR (Breakout) | Space Shooter PR #8 |
|-------|--------------------|----------------------|
| Contract | `src/core/ui/hudContract.ts` | Same shape; band atlas path may differ |
| Band PNG | `public/ui/hud-band.320x16.png` | `public/space-shooter/ui/hud-band.320x16.png` |
| Font PNG | `public/ui/font-atlas.5x7.png` | `public/space-shooter/ui/font-atlas.5x7.png` |
| Component | `HudHeaderUI` at `(0,0)` | `ShooterHud` wrapper + same header |

**Do not merge the two PRs blindly.** Expect conflicts on `hudContract.ts`, `BitmapText.ts`, `HudHeaderUI*`, and `ScoreUI`/`HeartsUI` delegations. When integrating, pick one public asset path (or alias both to the same file) and keep a single `HUD_CONTRACT.bandTexture`.

Full layout tables live in PR #8’s `docs/hud-header.md` once that branch lands. Contract summary:

- **320×16** top band; playfield at **y = 16**
- Lives: **12×12** hearts, **2px** gap, **x = 4**, vertically centered
- Score: cream bitmap `SCORE <n>`, **letter spacing 1**, **glyph Y = 4**, **right edge x = 316**
- Overflow: integer scale floor only (never fractional)

Breakout adds **`PlayfieldHintUI`** for serve/restart copy below the band (y = 18).
