# GameObjects and components

## Create and attach

```ts
const obj = new GameObject();
obj.addComponent(new TransformComponent(64, 120));
obj.addComponent(new SpriteRenderComponent("HeartBeast.32x32.png"));
levelRoot.addChild(obj);
```

Prefer `getRequiredComponent` when missing data is a bug; use `getComponent` when optional.

## Scene graph

```ts
parent.addChild(child);
parent.removeChild(child);
```

Each `GameObject` owns a Pixi `Container`. Parent transforms affect children.

## Component lookup rules

- Keyed by **constructor**; duplicate class → warning, existing instance returned
- `getComponent(ColliderComponent)` matches subclasses
- `enabled = false` skips `update` but keeps the component attached

## Initialization order

On first update of an object:

1. Every component on that object gets `onInit()` (order: registration order)
2. Then each frame: all `update(dt)` on that object, then children

Siblings exist during `onInit`, but **other objects** in the scene may not have initialized yet unless you defer logic to a later frame.

## Context access

```ts
override onInit() {
  const { width, height } = this.requireContext();
}

override update(dt: number) {
  if (this.context?.input.isDown("left")) { /* ... */ }
}
```

## Destroy

```ts
enemy.destroy();
```

Subclasses override `protected onDestroy()` for cleanup. Components should release listeners in `onDestroy`.

## Debugging hierarchy

```ts
level.getHierarchy(); // Level API
obj.getHierarchy();   // GameObject tree with names/uuids
```
