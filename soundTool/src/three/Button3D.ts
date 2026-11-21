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
  renderer: Renderer;
}

const MIN_PRESS_SINK = 2;

/**
 * A board button: a lit 3D body carrying its flat 2D artwork on the front.
 * Pressing it (mouse, touch or pen) sinks it into the board until release.
 */
export class Button3D extends Container3D {
  private readonly faceTexture: ContainerTexture;

  constructor(options: Button3DOptions) {
    super();
    const { face, width, height, depth = 8, bodyColor, facePadding = 0, renderer } = options;
    const body = new Mesh3D({
      geometry: new CubeGeometry({ width, height, depth }),
      material: new Material3D({ baseColor: bodyColor, roughness: 0.6 }),
    });
    body.position.z = depth / 2;

    const faceSize = { width: width + facePadding * 2, height: height + facePadding * 2 };
    this.faceTexture = new ContainerTexture({
      container: face,
      ...faceSize,
      transform: new Matrix().translate(facePadding, facePadding),
      resolution: 4,
      renderer,
    });
    const facePlane = new Mesh3D({
      geometry: new PlaneGeometry(faceSize),
      material: new FlatMaterial({ baseColorTexture: this.faceTexture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    facePlane.position.z = depth + 0.2;

    this.addChild(body, facePlane);

    // Pressed state: the whole button sinks toward the board while held.
    const sink = Math.max(MIN_PRESS_SINK, depth * 0.5);
    let pressed = false;
    let restZ = 0;
    const setPressed = (next: boolean): void => {
      if (pressed === next) return;
      pressed = next;
      if (pressed) {
        restZ = this.position.z;
        this.position.z = restZ - sink;
      } else {
        this.position.z = restZ;
      }
    };

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => setPressed(true));
    this.on('pointerup', () => setPressed(false));
    this.on('pointerupoutside', () => setPressed(false));
    this.on('pointercancel', () => setPressed(false));
  }

  /** Redraw the face artwork after it changed, e.g. a selection ring. */
  refreshFace(): void {
    this.faceTexture.render();
  }
}
