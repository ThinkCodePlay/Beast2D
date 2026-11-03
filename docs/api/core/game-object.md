# GameObject

Base scene-graph node. Every entity uses (or extends) `GameObject`.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `uuid` | `string` | Random UUID |
| `name` | `string` | Debug / hierarchy |
| `parent` | `GameObject \| null` | Scene graph |
| `children` | `GameObject[]` | Direct children |
| `container` | Pixi `Container` | Display list node |
| `destroyed` | `boolean` | After `destroy()` |
| `runWhenPaused` | `boolean` | Default `false` |
| `context` | `EngineContext \| null` | Inherited from parent or level root |

## Scene graph

| Method | Description |
| --- | --- |
| `addChild(child)` | Reparents; updates Pixi hierarchy |
| `removeChild(child)` | Detaches child |
| `root` | Topmost ancestor (level root when in a level) |
| `getWorldPosition()` | Composed world XY from transform chain |

## Components

| Method | Description |
| --- | --- |
| `addComponent(c)` | Register; returns existing if same class |
| `with(c)` | Fluent `addComponent` |
| `removeComponent(Class)` | Removes and destroys component |
| `getComponent(Class)` | Exact or subclass match |
| `getComponents(Class)` | All matching instances |
| `getRequiredComponent(Class, requester?)` | Throws if missing |
| `hasComponent(Class)` | Boolean |
| `transform` | Shortcut for `TransformComponent` (warns if missing) |

## Update & transform

| Method | Description |
| --- | --- |
| `update(dt, paused?)` | Components then children; handles init |
| `syncTransforms()` | Applies transforms in subtree |

## Destroy

| Method | Description |
| --- | --- |
| `destroy()` | Detach now; teardown end of frame |
| `protected onDestroy()` | Override for object-level cleanup |

| Static | Description |
| --- | --- |
| `GameObject.flushDestroyed()` | Runs pending teardowns (engine calls this) |

## Debugging

| Method | Description |
| --- | --- |
| `getHierarchy()` | `{ uuid, name, children[] }` tree |

## Related

- [Component base](../components/index.md#component-base)
- [TransformComponent](../components/movement.md#transformcomponent)
