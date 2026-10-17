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

export class GameObject {
  uuid: string = crypto.randomUUID();
  name: string = ObjectNames.BoxObject;

  parent: GameObject | null = null;
  children: GameObject[] = [];

  container: Container;
  private components: Map<string, Component> = new Map();
  destroyed: boolean = false;

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

  getWorldPosition(): { x: number; y: number } {
    // This will be handled by TransformComponent
    return { x: 0, y: 0 };
  }

  // Component Methods
  addComponent<T extends Component>(component: T): T {
    const componentName = component.constructor.name;

    if (this.components.has(componentName)) {
      console.warn(
        `Component ${componentName} already exists on this GameObject`,
      );
      return this.components.get(componentName) as T;
    }

    component.gameObject = this;
    this.components.set(componentName, component);

    return component;
  }

  removeComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): void {
    const componentName = componentClass.name;
    const component = this.components.get(componentName);

    if (component) {
      this.components.delete(componentName);
      GameObject.destroyComponent(component);
      component.gameObject = null;
    }
  }

  getComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): T | null {
    return (this.components.get(componentClass.name) as T) || null;
  }

  getRequiredComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
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

  hasComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): boolean {
    return this.components.has(componentClass.name);
  }

  // Update Loop
  update(deltaTime: number): void {
    if (this.destroyed) return;

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
      child.update(deltaTime);
    }
  }

  // Marks the object (and its children) as destroyed and detaches it right
  // away. Components are torn down by GameObject.flushDestroyed() at the end
  // of the frame, so it is safe to call this from inside update/callbacks.
  destroy(): void {
    if (this.destroyed) return;
    this.markDestroyed();

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

  private teardown(): void {
    for (const child of this.children) {
      child.teardown();
    }
    this.children = [];

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
