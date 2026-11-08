# Beast2D — tracked issues (Space Shooter)

Backlog items to file on GitHub when ready. Repo: `ThinkCodePlay/Beast2D`.

---

## Issue 3: Space Shooter — improve all level art and UI assets

### Summary

Sprites, backgrounds, enemy art, bullets, and HUD/dialog chrome for the Space Shooter sample should be upgraded for a cohesive **320×240 / 32×32** pixel look (see `AGENTS.md` display spec and `npm run assets:fit-display`).

### Scope (non-exhaustive)

| Area | Paths / refs |
|------|----------------|
| Player ship | `TEXTURE_BEAST_SHIP` → `BeastShip.32x32.png` (`publicAssets.ts`) |
| Parallax BG | `TEXTURE_STARS_LAYER_1/2` under `public/background/` |
| Enemies | Sheets/frames in `shooterAssets.ts` (`space-shooter/enemies/*`) |
| Bullet | `TEXTURE_SHOOTER_BULLET` |
| HUD / dialog | `TEXTURE_SHOOTER_*` from `shooterAssets.ts` / shared `public/ui/` |
| Hearts | `TEXTURE_HEART` |
| Optional tooling | `devtools/levels/space-shooter/generate-enemies.ts`, `devtools/assets/compress_display_png.py` |

### Expected behavior

- Art reads clearly at 1× integer scale (`image-rendering: pixelated`).
- Enemy sheets stay **32×32** frames; backgrounds **320×240**.
- Palette stays consistent with Beast2D (`Beast2D16` / project style) unless deliberately rebranding the sample.
- Update or regenerate assets so runtime paths in `shooterAssets.ts` and `publicAssets.ts` remain valid.

### Acceptance criteria

- [ ] Ship, enemies, bullet, backgrounds, and HUD/dialog textures are visibly improved in-game.
- [ ] No broken texture paths; level loads without missing assets.
- [ ] New PNGs follow naming/size conventions (`*.WxH.png` where applicable).

### Labels (suggested)

`enhancement`, `space-shooter`, `art`, `assets`

---

## Copy-paste titles for GitHub

1. **Space Shooter: Improve gameplay and UI assets**
