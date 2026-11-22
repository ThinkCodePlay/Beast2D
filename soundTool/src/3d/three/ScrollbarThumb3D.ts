import { ContainerTexture, FlatMaterial, Mesh3D, PlaneGeometry } from '@pixi/3d';
import { Container, Graphics, type Renderer } from 'pixi.js';
import { VISIBLE_SLOT_ROWS, type SoundBank } from '../../shared/bank';
import type { ControlRect } from './controlLayout';

/** World z of the overlay face: level with the bank-rows overlay. */
const OVERLAY_FACE_Z = 0.7;

/**
 * The bank scrollbar's thumb in the 3D scene: drawn live on an overlay over
 * the baked track (which ships without a thumb) so it sizes to the visible
 * share of the bank and moves with the scroll offset. The 3D scene scrolls
 * through its arrow buttons; the thumb is display-only here.
 */
export class ScrollbarThumb3D extends Mesh3D {
  constructor(rect: ControlRect, renderer: Renderer, bank: SoundBank) {
    const face = new Container();
    const art = new Graphics();
    face.addChild(art);
    const faceTexture = new ContainerTexture({
      container: face,
      width: rect.width,
      height: rect.height,
      resolution: 3,
      renderer,
    });
    super({
      geometry: new PlaneGeometry({ width: rect.width, height: rect.height }),
      material: new FlatMaterial({ baseColorTexture: faceTexture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    this.position.z = OVERLAY_FACE_Z;
    const draw = (): void => {
      art.clear();
      const share = Math.min(1, VISIBLE_SLOT_ROWS / bank.slots.length);
      const thumbHeight = Math.max(10, Math.round(rect.height * share));
      const travel = rect.height - thumbHeight;
      const top = bank.maxScrollOffset === 0 ? 0 : Math.round((bank.scrollOffset / bank.maxScrollOffset) * travel);
      art.rect(0, top, rect.width, thumbHeight).fill(0x8a63a0)
        .rect(0, top, rect.width, 1).fill(0xb18cc4);
      faceTexture.render();
    };
    draw();
    bank.onChange(draw);
  }
}
