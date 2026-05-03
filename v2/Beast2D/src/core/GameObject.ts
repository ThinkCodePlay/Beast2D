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
    component.init();

    return component;
  }

  removeComponent<T extends Component>(
    componentClass: new (...args: any[]) => T,
  ): void {
    const componentName = componentClass.name;
    const component = this.components.get(componentName);

    if (component) {
      component.destroy();
      component.gameObject = null;
      this.components.delete(componentName);
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
    // Update all components
    for (const component of this.components.values()) {
      if (component.enabled) {
        component.update(deltaTime);
      }
    }

    // Update children
    for (const child of this.children) {
      child.update(deltaTime);
    }
  }

  destroy(): void {
    // Destroy all children first
    for (const child of this.children) {
      child.destroy();
    }
    this.children = [];

    // Destroy all components
    for (const component of this.components.values()) {
      component.destroy();
    }
    this.components.clear();

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
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
