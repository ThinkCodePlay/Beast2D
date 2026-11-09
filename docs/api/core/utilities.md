# Utilities

## CanvasSize

Static facade initialized when the engine mounts. Use for construction-time values before `context` exists (for example `CanvasSize.canvasHeight` in a component constructor).

Prefer `requireContext()` in `update` / `onInit` when the object is always in a level.

## FixedTick

See [Services](./services.md#fixedstepper).

## Component base

See [Components](../components/index.md).
