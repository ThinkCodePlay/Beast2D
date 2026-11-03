# Prefabs

Constructor-configured `GameObject` subclasses.

## Box

```ts
new Box(
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  renderOptions?: RenderOptions,
)
```

Adds `TransformComponent` + `BoxRenderComponent`. Name: `BoxObject`.

## Circle

```ts
new Circle(
  x?: number,
  y?: number,
  radius?: number,
  renderOptions?: RenderOptions,
)
```

Adds `TransformComponent` + `CircleRenderComponent`. Name: `CircleObject`.

## Player

Space-shooter style player ship (texture + movement + shooting). See `src/core/prefabs/Player.ts` for the exact component stack.

## Spawner

GameObject wrapping `SpawnerComponent` with constructor args forwarded to the component.

See `src/core/prefabs/Spawner.ts` for signature.

## Extending

Create game prefabs under `src/game/.../Game Objects/` by extending `GameObject` and calling `addComponent` in the constructor — same pattern as core prefabs.

## Related

- [Prefabs and composition (syntax)](/syntax/prefabs-and-composition)
