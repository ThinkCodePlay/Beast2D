# Render components

Rendering components extend `RenderComponent`, which creates Pixi display objects on `onInit`.

## RenderComponent (base)

```ts
constructor(renderOptions?: RenderOptions)
```

| Method | Description |
| --- | --- |
| `setHorizontalFacing(direction: 1 \| -1)` | Mirror sprite/animation horizontally |

Subclasses implement `createGraphics()` returning a Pixi `Graphics` or compatible display object.

## BoxRenderComponent

```ts
new BoxRenderComponent(
  width: number,
  height: number,
  renderOptions?: RenderOptions,
)
```

## CircleRenderComponent

```ts
new CircleRenderComponent(radius?: number, renderOptions?: RenderOptions)
```

## SpriteRenderComponent

Static texture from `public/`.

```ts
new SpriteRenderComponent(texturePath: string, renderOptions?: RenderOptions)
```

## SpriteAnimationComponent

Multi-clip spritesheet animation using Pixi `AnimatedSprite`.

```ts
type SpritesheetClipConfig = {
  texturePath: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  frameCount: number;
  animationSpeed?: number;
};

type SpritesheetAnimationClipsOptions = {
  defaultClip: string;
  clips: Record<string, SpritesheetClipConfig>;
};

new SpriteAnimationComponent(
  clipsOptions: SpritesheetAnimationClipsOptions,
  renderOptions?: RenderOptions,
)
```

| Method | Description |
| --- | --- |
| `playClip(name, { restart? })` | Switch animation clip |
| `currentClip` | Active clip name or null |

Works with `HorizontalFacingComponent` / `HorizontalLocomotionAnimationComponent`.

## ScrollingBackgroundComponent

Scrolling layered backgrounds.

```ts
type ParallaxLayerConfig = {
  texturePath: string;
  scrollSpeedX?: number;
  scrollSpeedY?: number;
  zIndex?: number;
};

new ScrollingBackgroundComponent(layersConfig: ParallaxLayerConfig[])
```

## Related

- [Display spec](../../guide/display-spec.md)
- [HorizontalLocomotionAnimationComponent](./input-behavior.md#horizontallocomotionanimationcomponent)
