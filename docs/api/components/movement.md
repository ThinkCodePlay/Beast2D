# Movement components

## TransformComponent

Local transform applied to the GameObject container after updates.

```ts
new TransformComponent(x?: number, y?: number)
```

| Property | Description |
| --- | --- |
| `x`, `y` | Position |
| `rotation` | Radians |
| `scaleX`, `scaleY` | Scale |

| Method | Description |
| --- | --- |
| `getWorldPosition()` | Composed position |
| `applyToContainer()` | Writes to Pixi container (called by `syncTransforms`) |

## UserInputComponent

Four-direction movement using input actions `left`/`right`/`up`/`down`.

```ts
new UserInputComponent(speed?: number) // default 5
```

## HorizontalInputComponent

Horizontal only (`left` / `right`).

```ts
new HorizontalInputComponent(speed?: number) // default 6
```

## HorizontalClampComponent

Clamps transform X each frame.

```ts
new HorizontalClampComponent(minX: number, maxX: number)
```

## HorizontalFacingComponent

Flips horizontal render facing from velocity or input (works with `RenderComponent.setHorizontalFacing`).

No constructor args.

## VerticalMoveComponent

Constant vertical motion.

```ts
new VerticalMoveComponent(speedY: number)
```

## Related

- [Input service](../core/services.md#input)
- [Render facing](./render.md)
