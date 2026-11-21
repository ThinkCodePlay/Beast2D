import { Container3D, ContainerTexture, CubeGeometry, FlatMaterial, Material3D, Mesh3D, PlaneGeometry } from '@pixi/3d';
import { Container, Matrix, type Renderer } from 'pixi.js';

export interface Button3DOptions {
  /** 2D face artwork, drawn live onto the button's front. */
  face: Container;
  /** Face size in board pixels. */
  width: number;
  height: number;
  /** How far the button stands off the board. */
  depth?: number;
  /** Lit color of the button's sides. */
  bodyColor: number;
  /** Transparent margin captured around the face artwork (e.g. a selection ring). */
  facePadding?: number;
  /** Optional selection ring artwork, drawn once behind the face and shown with setSelected. */
  ring?: Container;
  renderer: Renderer;
}

const MIN_PRESS_SINK = 2;
const RING_PARKED_DEPTH = 20;

/**
 * A board button: a lit 3D body carrying its flat 2D artwork on the front.
 * Pressing it (mouse, touch or pen) sinks it into the board until release.
 */
export class Button3D extends Container3D {
  private ringPlane?: Mesh3D;
  private ringDepth = 0;
  private pressSink = 0;
  private held = false;
  private latched = false;
  private shownPressed = false;
  private restZ = 0;

  constructor(options: Button3DOptions) {
    super();
    const { face, width, height, depth = 8, bodyColor, facePadding = 0, ring, renderer } = options;
    const body = new Mesh3D({
      geometry: new CubeGeometry({ width, height, depth }),
      material: new Material3D({ baseColor: bodyColor, roughness: 0.6 }),
    });
    body.position.z = depth / 2;

    const faceSize = { width: width + facePadding * 2, height: height + facePadding * 2 };
    const faceTexture = new ContainerTexture({
      container: face,
      ...faceSize,
      transform: new Matrix().translate(facePadding, facePadding),
      resolution: 4,
      renderer,
    });
    const facePlane = new Mesh3D({
      geometry: new PlaneGeometry(faceSize),
      material: new FlatMaterial({ baseColorTexture: faceTexture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    facePlane.position.z = depth + 0.2;

    this.addChild(body, facePlane);
    if (ring) this.addChild(this.createRingPlane(ring, faceSize, facePadding, depth, renderer));

    // Pressed state: the whole button sinks toward the board while held or latched.
    this.pressSink = Math.max(MIN_PRESS_SINK, depth * 0.5);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => { this.held = true; this.applyPressed(); });
    const release = (): void => { this.held = false; this.applyPressed(); };
    this.on('pointerup', release);
    this.on('pointerupoutside', release);
    this.on('pointercancel', release);
  }

  /** Hold or release the sunken look for latched toggles like the loop button. */
  setLatched(latched: boolean): void {
    this.latched = latched;
    this.applyPressed();
  }

  /** Sunken while held or latched; springs back only when neither applies. */
  private applyPressed(): void {
    const next = this.held || this.latched;
    if (this.shownPressed === next) return;
    this.shownPressed = next;
    if (next) {
      this.restZ = this.position.z;
      this.position.z = this.restZ - this.pressSink;
    } else {
      this.position.z = this.restZ;
    }
  }

  /** Show or hide the selection ring. */
  setSelected(selected: boolean): void {
    // Parked behind the board when unselected: moving the plane is more reliable than hiding it on WebGPU.
    if (this.ringPlane) this.ringPlane.position.z = selected ? this.ringDepth : -RING_PARKED_DEPTH;
  }

  private createRingPlane(ring: Container, size: { width: number; height: number }, padding: number, depth: number, renderer: Renderer): Mesh3D {
    const texture = new ContainerTexture({
      container: ring,
      ...size,
      transform: new Matrix().translate(padding, padding),
      resolution: 4,
      renderer,
    });
    const plane = new Mesh3D({
      geometry: new PlaneGeometry(size),
      material: new FlatMaterial({ baseColorTexture: texture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    this.ringDepth = depth + 0.1; // Just under the face, so only the ring's spill shows.
    this.ringPlane = plane;
    this.setSelected(false);
    return plane;
  }
}
