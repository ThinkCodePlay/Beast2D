# Input and behavior components

## InteractiveComponent

Pointer hit area on the GameObject container.

```ts
type InteractiveOptions = {
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
};

new InteractiveComponent(options?: InteractiveOptions)
```

## SpaceShootInputComponent

Fires when `shoot` action is pressed; delegates to a `SpawnerComponent`.

```ts
new SpaceShootInputComponent(spawner: SpawnerComponent)
```

## SpawnerComponent

Repeating spawn callback at random intervals and positions.

```ts
type NumberRange = { min: number; max: number };
type NumberOrRange = number | NumberRange;

new SpawnerComponent(
  intervalRangeSeconds: NumberOrRange,
  xRange: NumberOrRange,
  yRange: NumberOrRange,
  spawnCallback: (x: number, y: number) => void,
)
```

Pass a single number for fixed interval or position; or `{ min, max }` for random ranges.

## HorizontalLocomotionAnimationComponent

Drives `SpritesheetAnimationRenderComponent` clips from horizontal movement.

```ts
new HorizontalLocomotionAnimationComponent(
  idleClip?: string,  // default "idle"
  walkClip?: string,  // default "walk"
)
```

Requires sibling `SpritesheetAnimationRenderComponent` and horizontal motion (input or velocity).

## DestroyOutOfBoundsComponent

Destroys the owner when transform leaves bounds (defaults include canvas edges).

```ts
type DestroyBounds = {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
};

new DestroyOutOfBoundsComponent(bounds?: DestroyBounds)
```

## DestroyBelowScreenComponent

Specialization: destroy when below the screen.

```ts
new DestroyBelowScreenComponent(
  screenHeight?: number,  // default Globals.canvasHeight
  offset?: number,
)
```

## Related

- [Prefabs](../prefabs.md) — `Spawner` prefab
- [Syntax: spawning](../../syntax/prefabs-and-composition.md#spawning-into-world-space)
