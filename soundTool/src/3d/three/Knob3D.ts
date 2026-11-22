import {
  Container3D,
  ContainerTexture,
  CylinderGeometry,
  FlatMaterial,
  Material3D,
  Mesh3D,
  PlaneGeometry,
} from "@pixi/3d";
import { Container, type Renderer } from "pixi.js";
import { clampValue, KNOB_SWEEP } from "../../shared/ui/knobTurn";

export interface Knob3DOptions {
  /** 2D cap artwork (disk and needle), drawn live onto the rotor's top. */
  cap: Container;
  /** The 0..1 value the cap artwork was drawn at; spins are measured from it. */
  value: number;
  /** Rotor radius in board pixels. */
  radius?: number;
  /** How far the rotor stands off the board. */
  depth?: number;
  /** Lit color of the rotor's rim. */
  bodyColor?: number;
  renderer: Renderer;
}

/**
 * A rotary knob: a lit 3D cylinder carrying its flat 2D cap artwork on top.
 * setValue spins rotor and cap around the dial axis, like a physical rotor.
 */
export class Knob3D extends Container3D {
  private readonly restValue: number;
  private readonly spinner: Container3D;
  private value: number;

  constructor(options: Knob3DOptions) {
    super();
    const {
      cap,
      value,
      radius = 13,
      depth = 7,
      bodyColor = 0x321b47,
      renderer,
    } = options;
    this.restValue = clampValue(value);
    this.value = this.restValue;

    const rotor = new Mesh3D({
      geometry: new CylinderGeometry({
        radiusTop: radius,
        radiusBottom: radius + 1,
        height: depth,
        radialSegments: 24,
      }),
      material: new Material3D({ baseColor: bodyColor, roughness: 0.5 }),
    });
    rotor.rotation.x = Math.PI / 2; // Cylinder axis is Y; face the top toward the camera (+Z).
    rotor.position.z = depth / 2;

    const capSize = 32; // The cap artwork tile is 32×32; its disk art overhangs the rim like a cap lip.
    const capTexture = new ContainerTexture({
      container: cap,
      width: 32,
      height: 32,
      resolution: 4,
      renderer,
    });
    const capPlane = new Mesh3D({
      geometry: new PlaneGeometry({ width: capSize, height: capSize }),
      material: new FlatMaterial({
        baseColorTexture: capTexture,
        alphaMode: "blend",
      }),
      castShadow: false,
      receiveShadow: false,
    });
    capPlane.position.z = depth + 0.2;

    // Rotor and cap spin together around the view axis, as one physical part.
    this.spinner = new Container3D();
    this.spinner.addChild(rotor, capPlane);
    this.addChild(this.spinner);

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  /** The current 0..1 dial value. */
  getValue(): number {
    return this.value;
  }

  /**
   * Spin the rotor to a 0..1 value. Dial angles are screen-space (y down), so
   * the world rotation around +Z is the rest angle minus the new angle.
   */
  setValue(value: number): void {
    this.value = clampValue(value);
    this.spinner.rotation.z = KNOB_SWEEP * (this.restValue - this.value);
  }
}
