# Beast2D — tracked issues (Space Shooter)

Backlog items to file on GitHub when ready. Repo: `ThinkCodePlay/Beast2D`.

---

## Issue 1: Space Shooter — game over dimmer / overlay covers playfield incorrectly

### Summary

On **GAME OVER**, a semi-transparent overlay appears beyond (or in addition to) the dialog panel chrome and obscures the game in a way that looks wrong—overlay reads as bleeding past the dialog border rather than a clean modal presentation.

### Current behavior

- `DialogUI.open("GAME OVER", …)` is triggered from the player spaceship when hearts reach zero (`Spaceship.ts`).
- `DialogUIRenderComponent.paint()` draws a **full 320×240** grid of 8×8 filled rects (`Beast2D16.PlumOutline`, alpha `0.72`) whenever the message includes `"OVER"` or score &gt; 0, then draws the nine-slice panel on top.
- The dimmer is tied to the dialog `Graphics` object, not clipped to the panel bounds, so the whole framebuffer is dimmed—not just the area outside the panel.

### Expected behavior

- Game over should present a clear dialog (panel + title + score + RESTART) with overlay treatment that **does not** look like a broken/full-screen layer past the panel border.
- Options (pick one approach in implementation):
  - Full-screen dim **behind** the panel only (separate layer or draw order), with crisp panel edges; or
  - No full-screen dim—only the panel modal; or
  - Dimmed region with a **cut-out** or mask around the panel if design calls for partial dim.

### Relevant files

- `src/core/components/UI/DialogUIRenderComponent.ts` (dimmer loop ~lines 122–130)
- `src/game/Space Shooter/Game Objects/Spaceship.ts` (opens game over dialog)
- `src/game/Space Shooter/SpaceShooter.ts` (dialog placement/size: 256×96 centered)

### Acceptance criteria

- [x] Trigger game over in Space Shooter; overlay/panel look intentional—no visible “extra” overlay past panel border that looks like a bug.
- [x] START dialog (pre-game) still looks correct if it shares the same render path.
- [x] RESTART still reloads the level and resumes the game manager.

**Resolution:** Game-over dimmer is drawn in display space by offsetting with `-getWorldPosition()` so a centered `DialogUI` no longer shifts the backdrop off-screen.

### Labels (suggested)

`bug`, `space-shooter`, `ui`

---

## Issue 2: Space Shooter — player hitbox should be a smaller circle

### Summary

The player uses a **square** collider sized almost like the full 32×32 sprite. Hits feel like a box around the ship. The hitbox should be a **circle**, tighter to the visible ship—similar to bullets (`CircleColliderComponent`) and scout-style enemies.

### Current behavior

```ts
new SquareColliderComponent(shipWidth - 8, shipWidth - 10, { … })
```

in `Spaceship.ts` (`shipWidth === SPRITE_SIZE`).

### Expected behavior

- Replace with `CircleColliderComponent` (radius TBD in pixels, grid-aligned; likely smaller than half of 32×32—e.g. compare enemy circle radius `10` in `EnemyCircle.ts` and tune for fairness).
- Keep `CollisionLayers.Player`, `ColliderModes.Active`, mask `Enemy`, and existing `onCollisionEnter` logic (hearts, invuln, burst, game over).
- Explosion / spawn position may need a small offset tweak if the collider center differs from the square collider.

### Relevant files

- `src/game/Space Shooter/Game Objects/Spaceship.ts`
- `src/core/components/Collision/CircleColliderComponent.ts`
- Reference: `src/game/Space Shooter/Game Objects/Bullet.ts`, `EnemyCircle.ts`

### Acceptance criteria

- [x] Player–enemy collisions register on a circular hitbox visually closer to the ship silhouette.
- [x] No regression to horizontal movement, clamping, or bullet spawning.
- [x] Game over / heart loss behavior unchanged aside from fairer hits.

**Resolution:** `Spaceship` uses `CircleColliderComponent` radius `10`, center `(16, 16)` on the 32×32 sprite; optional `centerX`/`centerY` on `CircleColliderComponent` for sprite-centered hits.

### Labels (suggested)

`enhancement`, `space-shooter`, `collision`

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
| Optional tooling | `src/game/Space Shooter/scripts/generate-ui.ts`, `scripts/compress_display_png.py` |

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

1. **Space Shooter: Fix game over overlay / dimmer past dialog border**
2. **Space Shooter: Use tighter circular player hitbox**
3. **Space Shooter: Improve gameplay and UI assets**
