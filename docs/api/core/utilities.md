# Utilities

## Globals

Static facade initialized when the engine mounts. Use for construction-time values before `context` exists (for example `Globals.canvasHeight` in a component constructor).

Prefer `requireContext()` in `update` / `onInit` when the object is always in a level.

## ObjectPool

Export: `ObjectPool<T>`.

Generic pool for reusable **non-GameObject** data. Does not resurrect destroyed nodes.

## FixedStepper

See [Services](./services.md#fixedstepper).

## Component base

See [Components](../components/index.md).
