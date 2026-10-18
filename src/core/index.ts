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

export { Component } from "./components/Component";
export { TransformComponent } from "./components/Movement/TransformComponent";
export { UserInputComponent } from "./components/Movement/UserInputComponent";
export { HorizontalInputComponent } from "./components/Movement/HorizontalInputComponent";
export { HorizontalClampComponent } from "./components/Movement/HorizontalClampComponent";
export { VerticalMoveComponent } from "./components/Movement/VerticalMoveComponent";
export { SpaceShootInputComponent } from "./components/Input/SpaceShootInputComponent";
export {
  InteractiveComponent,
  type InteractiveOptions,
} from "./components/Input/InteractiveComponent";
export { SpawnerComponent } from "./components/Behavior/SpawnerComponent";
export {
  DestroyOutOfBoundsComponent,
  DestroyBelowScreenComponent,
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
export { ParallaxBackgroundRenderComponent } from "./components/Render/ParallaxBackgroundRenderComponent";

export { Box } from "./prefabs/Box";
export { Circle } from "./prefabs/Circle";
export { Player } from "./prefabs/Player";
export { Spawner } from "./prefabs/Spawner";
