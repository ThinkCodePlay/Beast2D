/* GameObject.ts
 GameObject is a base node that is used for every entity in the game scene.
 Every GameObject has the following features:
 - Unique Identifier (UUID)
 - Scene Graph Structure (parent-child relationships)
 - Component System (add, remove, get components)
 - Update Loop Integration
 - Transform Handling (position, rotation, scale via TransformComponent)
*/

import { Container } from "pixi.js";
import { Component } from "./components/Component";
import { TransformComponent } from "./components/Movement/TransformComponent";
import { ObjectNames } from "./consts";
import type { EngineContext } from "./EngineContext";

type ComponentClass<T extends Component> = abstract new (...args: any[]) => T;

export class GameObject {
  uuid: string = crypto.randomUUID();
  name: string = ObjectNames.GameObject;

  parent: GameObject | null = null;
  children: GameObject[] = [];

  container: Container;
  // Keyed by class reference (safe under minification)
  private components: Map<Function, Component> = new Map();
  destroyed: boolean = false;

  /** When false (default) the object's components do not update while paused. */
  runWhenPaused: boolean = false;

  private _context: EngineContext | null = null;

  private static pendingDestroy: GameObject[] = [];

  constructor(container?: Container) {
    this.container = container ?? new Container();
  }

  // Scene Graph Methods
  addChild(child: GameObject): void {
    if (child.parent) {
      child.parent.removeChild(child);
    }

    if (child.container.parent) {
      child.container.parent.removeChild(child.container);
    }

    this.container.addChild(child.container);
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: GameObject): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);

      if (child.container.parent === this.container) {
        this.container.removeChild(child.container);
      }

      child.parent = null;
    }
  }

  /** Engine services. Set on the level root, inherited by all descendants. */
  get context(): EngineContext | null {
    return this._context ?? this.parent?.context ?? null;
  }

  set context(value: EngineContext | null) {
    this._context = value;
  }

  /** Topmost ancestor (the level root for objects in a level). */
  get root(): GameObject {
    let node: GameObject = this;
    while (node.parent) node = node.parent;
    return node;
  }

  getWorldPosition(): { x: number; y: number } {
    return this.getComponent(TransformComponent)?.getWorldPosition() ??
      this.parent?.getWorldPosition() ?? { x: 0, y: 0 };
  }

  // Component Methods
  addComponent<T extends Component>(component: T): T {
    const key = component.constructor;
    const existing = this.components.get(key);

    if (existing) {
      console.warn(
        `Component ${key.name} already exists on this GameObject`,
      );
      return existing as T;
    }

    component.gameObject = this;
    this.components.set(key, component);

    return component;
  }

  /** Fluent variant of addComponent for building objects inline. */
  with(component: Component): this {
    this.addComponent(component);
    return this;
  }

  removeComponent<T extends Component>(componentClass: ComponentClass<T>): void {
    const component = this.getComponent(componentClass);
    if (!component) return;

    this.components.delete(component.constructor);
    GameObject.destroyComponent(component);
    component.gameObject = null;
  }

  /** Finds a component by its class, or by a base class it extends. */
  getComponent<T extends Component>(componentClass: ComponentClass<T>): T | null {
    const exact = this.components.get(componentClass);
    if (exact) return exact as T;

    for (const component of this.components.values()) {
      if (component instanceof componentClass) return component as T;
    }
    return null;
  }

  getComponents<T extends Component>(componentClass: ComponentClass<T>): T[] {
    return [...this.components.values()].filter(
      (component): component is T => component instanceof componentClass,
    );
  }

  getRequiredComponent<T extends Component>(
    componentClass: ComponentClass<T>,
    requester?: string,
  ): T {
    const component = this.getComponent(componentClass);
    if (!component) {
      const requestedBy = requester ? ` for ${requester}` : "";
      throw new Error(
        `${componentClass.name} is required${requestedBy} on GameObject ${this.uuid}`,
      );
    }

    return component;
  }

  hasComponent<T extends Component>(componentClass: ComponentClass<T>): boolean {
    return this.getComponent(componentClass) !== null;
  }

  // Update Loop
  update(
    deltaTime: number,
    paused: boolean = this.context?.time.paused ?? false,
  ): void {
    if (this.destroyed) return;

    if (paused && !this.runWhenPaused) {
      // Paused: skip own components but still reach children (they may be UI).
      for (const child of [...this.children]) child.update(deltaTime, paused);
      return;
    }

    // Iterate over snapshots: components and children may be added or
    // destroyed while updating.
    const components = [...this.components.values()];

    // Initialize every component first so onInit can rely on siblings.
    for (const component of components) {
      if (!component.initialized && !component.destroyed) {
        component.initialized = true;
        component.onInit();
      }
    }

    for (const component of components) {
      if (this.destroyed) return;
      if (component.enabled && !component.destroyed) {
        component.update(deltaTime);
      }
    }

    for (const child of [...this.children]) {
      if (this.destroyed) return;
      child.update(deltaTime, paused);
    }
  }

  /** Applies every TransformComponent in this subtree to its container. */
  syncTransforms(): void {
    this.getComponent(TransformComponent)?.applyToContainer();
    for (const child of this.children) child.syncTransforms();
  }

  // Marks the object (and its children) as destroyed and detaches it right
  // away. Components are torn down by GameObject.flushDestroyed() at the end
  // of the frame, so it is safe to call this from inside update/callbacks.
  destroy(): void {
    if (this.destroyed) return;
    this.markDestroyed();

    // Keep the context reachable for onDestroy hooks after detaching.
    this._context = this.context;

    if (this.parent) {
      this.parent.removeChild(this);
    } else if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }

    GameObject.pendingDestroy.push(this);
  }

  private markDestroyed(): void {
    this.destroyed = true;
    for (const child of this.children) {
      child.markDestroyed();
    }
  }

  // Tears down every object destroyed since the last flush.
  static flushDestroyed(): void {
    while (GameObject.pendingDestroy.length > 0) {
      const pending = GameObject.pendingDestroy;
      GameObject.pendingDestroy = [];
      for (const gameObject of pending) {
        gameObject.teardown();
      }
    }
  }

  /**
   * Called once when the object is torn down (end of the frame in which
   * `destroy()` was called), for this object and every descendant.
   * Override to release object-level resources; components get `onDestroy`.
   */
  protected onDestroy(): void {}

  private teardown(): void {
    for (const child of this.children) {
      child.teardown();
    }
    this.children = [];
    this.onDestroy();

    for (const component of [...this.components.values()]) {
      GameObject.destroyComponent(component);
    }
    this.components.clear();

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    if (!this.container.destroyed) {
      this.container.destroy({ children: true });
    }
  }

  private static destroyComponent(component: Component): void {
    if (component.destroyed) return;
    component.destroyed = true;
    // onDestroy only pairs with an onInit that actually ran.
    if (component.initialized) {
      component.onDestroy();
    }
  }

  // Direct access to TransformComponent (if exists)
  get transform(): TransformComponent | null {
    if (!this.hasComponent(TransformComponent)) {
      console.warn("TransformComponent not found on GameObject " + this.uuid);
      return null;
    }
    return this.getComponent(TransformComponent);
  }

  // Get hierarchy structure for scene graph display
  getHierarchy(): { uuid: string; name: string; children: any[] } {
    return {
      uuid: this.uuid,
      name: this.name,
      children: this.children.map((child) => child.getHierarchy()),
    };
  }
}
