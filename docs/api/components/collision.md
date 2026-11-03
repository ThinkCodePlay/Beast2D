# Collision components

Collision uses `ColliderComponent` shapes registered with `context.collisions`. Debug outlines draw when `EngineContext.debug` is true.

## ColliderOptions

```ts
interface ColliderOptions {
  layer?: CollisionLayer;   // default "default"
  mode?: ColliderMode;      // default "passive"
  mask?: CollisionLayer[];  // empty = collide with all layers
  onCollisionEnter?: (self, other) => void;
  onCollisionStay?: (self, other) => void;
  onCollisionExit?: (self, other) => void;
}
```

## ColliderComponent (abstract)

| Property | Description |
| --- | --- |
| `isColliding` | True while overlapping |

Subclasses implement shape in local space; system transforms to world space.

## CircleColliderComponent

```ts
new CircleColliderComponent(
  radius: number,
  options?: ColliderOptions,
  debugOptions?: ColliderDebugOptions,
)
```

## SquareColliderComponent

Axis-aligned box in local space.

```ts
new SquareColliderComponent(
  width: number,
  height: number,
  options?: ColliderOptions,
  debugOptions?: ColliderDebugOptions,
)
```

## Layers and modes

See [Constants](../constants.md) for `CollisionLayers` and `ColliderModes`.

Typical pattern: player `active` on `player` layer; bullets `active` on `bullet` with `mask: [CollisionLayers.Enemy]`.

## Related

- [Services: CollisionSystem](../core/services.md#collisionsystem)
