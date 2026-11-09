/* Public API of the Beast2D engine core. */

export { Engine, type EngineOptions } from "./Engine";
export { EngineContext } from "./EngineContext";
export { GameManager } from "./GameManager";
export { Level } from "./Level";
export { LevelManager } from "./LevelManager";
export { GameObject } from "./GameObject";
export { CanvasSize } from "./canvasSize";
export { Time, FRAMES_PER_SECOND } from "./Time";
export { Timers, type TimerHandle } from "./Timers";
export { Input, DefaultBindings } from "./Input";
export { FixedTick } from "./fixedTick";
export { CollisionSystem } from "./CollisionSystem";
export * from "./display";
export {
  attachDisplayScaleFit,
  computeIntegerDisplayScale,
  configurePixelArtRendering,
  displayCssSize,
  type DisplayScaleFitOptions,
} from "./displayScale";

export { Component } from "./components/Component";
export { TransformComponent } from "./components/Movement/TransformComponent";
export { ClampComponent, type ClampEdges } from "./components/Movement/ClampComponent";
export { ConstantMoveComponent } from "./components/Movement/ConstantMoveComponent";
export { Movement } from "./components/Movement/Movement";
export { KeyboardMovement } from "./components/Movement/KeyboardMovement";
export { PointerMovement } from "./components/Movement/PointerMovement";
export { MovementInput } from "./components/Movement/MovementInput";
export { stepToward, type MoveTowardsAxes } from "./components/Movement/stepToward";
export {
  combineDirections,
  type MovementDirection,
} from "./components/Movement/combineDirections";
export { directionToPointer } from "./components/Movement/directionToPointer";
export { pointerToGame } from "./components/Movement/pointerToGame";
export {
  wireUiPointerButton,
  type WireUiPointerButtonOptions,
} from "./ui/UiPointerButton";
export {
  ClickableComponent,
  type ClickableOptions,
} from "./components/Input/ClickableComponent";
export { SpawnerComponent } from "./components/Behavior/SpawnerComponent";
export {
  DestroyOutOfBoundsComponent,
  type DestroyBounds,
} from "./components/Behavior/DestroyOutOfBoundsComponent";
export {
  ColliderComponent,
  type ColliderOptions,
} from "./components/Collision/ColliderComponent";
export { CircleColliderComponent } from "./components/Collision/CircleColliderComponent";
export { SquareColliderComponent } from "./components/Collision/SquareColliderComponent";
export { RenderComponent } from "./components/Render/RenderComponent";
export { BoxRenderComponent } from "./components/Render/BoxRenderComponent";
export { CircleRenderComponent } from "./components/Render/CircleRenderComponent";
export { SpriteRenderComponent } from "./components/Render/SpriteRenderComponent";
export {
  SpriteAnimationComponent,
  type SpritesheetAnimationClipsOptions,
  type SpritesheetClipConfig,
} from "./components/Render/SpriteAnimationComponent";
export { ScrollingBackgroundComponent } from "./components/Render/ScrollingBackgroundComponent";

export { Box } from "./prefabs/Box";
export { Circle } from "./prefabs/Circle";
export { Spawner } from "./prefabs/Spawner";
