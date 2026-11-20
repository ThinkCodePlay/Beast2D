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

/** A board button: a lit 3D body carrying its flat 2D artwork on the front. */
export class Button3D extends Container3D {
  constructor(options: Button3DOptions) {
    super();
    const { face, width, height, depth = 8, bodyColor, facePadding = 0, renderer } = options;
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
  }
}
