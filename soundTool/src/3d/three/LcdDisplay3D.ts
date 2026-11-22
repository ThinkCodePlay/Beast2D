import { Container3D, ContainerTexture, FlatMaterial, Mesh3D, PlaneGeometry } from '@pixi/3d';
import type { Renderer } from 'pixi.js';
import type { SoundBank } from '../../shared/bank';
import { SoundNameLcd } from '../../shared/components/SoundNameLcd';
import type { ControlRect } from './controlLayout';

/** World z of the overlay face: just above the cabinet's front face. */
const OVERLAY_FACE_Z = 0.7;

/**
 * The 3D scene's sound-name LCD: the shared LCD component drawn onto a flat
 * overlay on the cabinet face, re-rendered whenever the bank selection
 * changes so the name stays current like the 2D board's.
 */
export class LcdDisplay3D extends Container3D {
  constructor(rect: ControlRect, renderer: Renderer, bank: SoundBank) {
    super();
    const faceTexture = new ContainerTexture({
      container: new SoundNameLcd(rect.width, bank),
      width: rect.width,
      height: rect.height,
      resolution: 3,
      renderer,
    });
    const face = new Mesh3D({
      geometry: new PlaneGeometry({ width: rect.width, height: rect.height }),
      material: new FlatMaterial({ baseColorTexture: faceTexture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    face.position.z = OVERLAY_FACE_Z;
    this.addChild(face);
    bank.onChange(() => faceTexture.render());
  }
}
