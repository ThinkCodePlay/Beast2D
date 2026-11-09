# Prefabs and composition

**Prefabs** are `GameObject` subclasses that encode a reusable bundle of components via constructor parameters.

## Built-in prefabs

| Class | Constructor highlights |
| --- | --- |
| `Box` | `(x, y, width, height, renderOptions?)` → transform + box render |
| `Circle` | `(x, y, radius, renderOptions?)` → transform + circle render |
| `Player` | Space-shooter style ship setup |
| `Spawner` | Object with `SpawnerComponent` pre-wired |

See [Prefabs API](../api/prefabs.md) for details.

## Pattern: game-specific prefab

Mirror `src/game/Bunny Hop/Game Objects/BunnyPlayer.ts`:

1. Extend `GameObject`
2. Set `name` and `TransformComponent`
3. Add render + gameplay components
4. Expose tunables as constructor args

## Pattern: behavior-only component

Keep visuals in render components; encode rules in small components (`HorizontalClampComponent`, `DestroyBelowScreenComponent`, etc.) and combine with `.with()`.

## Spawning into world space

```ts
spawnerComponentCallback: (x, y) => {
  const bullet = new Bullet(x, y);
  this.levelRoot.addChild(bullet); // not under the ship
};
```

Pass `levelRoot` via closure or store a reference on the level class.

## Anti-patterns

- Mega-components that render, move, collide, and read input in one class
- Spawning gameplay objects under rotating parents when world alignment matters
- Relying on `CanvasSize` inside per-frame logic instead of `context`
