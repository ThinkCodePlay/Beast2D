/* Public API of the Beast2D engine core. */

export { Engine, type EngineOptions } from "./Engine";
export { EngineContext } from "./EngineContext";
export { GameManager } from "./GameManager";
export { Level } from "./Level";
export { LevelManager } from "./LevelManager";
export { GameObject } from "./GameObject";
export { Globals } from "./Globals";
export { Time, FRAMES_PER_SECOND } from "./Time";
export { Timers, type TimerHandle } from "./Timers";
export { Input, DefaultBindings } from "./Input";
export { FixedStepper } from "./FixedStepper";
export { ObjectPool } from "./ObjectPool";
export { CollisionSystem } from "./CollisionSystem";
export * from "./consts";
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
export { MovementDirectionSource } from "./components/Movement/MovementDirectionSource";
export { stepMoveTowards, type MoveTowardsAxes } from "./moveTowards";
export {
  combineDirections,
  type MovementDirection,
} from "./movement/combineDirections";
export { pointerArrivalDirection } from "./movement/pointerArrivalDirection";
export { clientToGameCoords } from "./pointer/clientToGameCoords";
export {
  wireUiPointerButton,
  type WireUiPointerButtonOptions,
} from "./ui/UiPointerButton";
export {
  InteractiveComponent,
  type InteractiveOptions,
} from "./components/Input/InteractiveComponent";
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
  SpritesheetAnimationRenderComponent,
  type SpritesheetAnimationClipsOptions,
  type SpritesheetClipConfig,
} from "./components/Render/SpritesheetAnimationRenderComponent";
export { ParallaxBackgroundRenderComponent } from "./components/Render/ParallaxBackgroundRenderComponent";

export { Box } from "./prefabs/Box";
export { Circle } from "./prefabs/Circle";
export { Player } from "./prefabs/Player";
export { Spawner } from "./prefabs/Spawner";
