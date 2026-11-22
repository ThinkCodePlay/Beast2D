import {
  Container3D,
  ContainerTexture,
  FlatMaterial,
  Mesh3D,
  PlaneGeometry,
} from "@pixi/3d";
import { Container, Graphics, type Renderer } from "pixi.js";
import { VISIBLE_SLOT_ROWS, type SoundBank } from "../../shared/bank";
import type { ControlRect } from "./controlLayout";

/** World z of the overlay face: level with the bank-rows overlay. */
const OVERLAY_FACE_Z = 0.7;

/**
 * The bank scrollbar's thumb in the 3D scene: drawn live on an overlay over
 * the baked track (which ships without a thumb) so it sizes to the visible
 * share of the bank and moves with the scroll offset. Like the 2D thumb it
 * is the live control: a press inside the thumb drags it to scroll (the
 * scene tracks the drag, see SoundBoardScene3D.bindPointer), and a press on
 * the bare track does nothing.
 */
export class ScrollbarThumb3D extends Container3D {
  /** The drawn thumb's current span in overlay-local pixels, for hit-testing. */
  private thumbTop = 0;
  private thumbHeight = 0;
  /** The full travel height the thumb moves in (the overlay's height). */
  private readonly trackHeight: number;

  constructor(
    rect: ControlRect,
    renderer: Renderer,
    private readonly bank: SoundBank,
  ) {
    super();
    this.trackHeight = rect.height;
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
    const plane = new Mesh3D({
      geometry: new PlaneGeometry({ width: rect.width, height: rect.height }),
      material: new FlatMaterial({
        baseColorTexture: faceTexture,
        alphaMode: "blend",
      }),
      castShadow: false,
      receiveShadow: false,
    });
    plane.position.z = OVERLAY_FACE_Z;
    this.addChild(plane);
    this.eventMode = "static";
    this.cursor = "pointer";
    const draw = (): void => {
      art.clear();
      const share = Math.min(1, VISIBLE_SLOT_ROWS / bank.slots.length);
      this.thumbHeight = Math.max(10, Math.round(rect.height * share));
      const travel = rect.height - this.thumbHeight;
      this.thumbTop =
        bank.maxScrollOffset === 0
          ? 0
          : Math.round((bank.scrollOffset / bank.maxScrollOffset) * travel);
      art
        .rect(0, this.thumbTop, rect.width, this.thumbHeight)
        .fill(0x8a63a0)
        .rect(0, this.thumbTop, rect.width, 1)
        .fill(0xb18cc4);
      faceTexture.render();
    };
    draw();
    bank.onChange(draw);
  }

  /**
   * The grab offset for a press at an overlay-local y, or null when the
   * press misses the thumb (the bare track is not draggable, as in 2D). The
   * grab area is a little taller than short thumbs, matching the 2D thumb.
   */
  grabOffsetAt(y: number): number | null {
    const grabHeight = Math.max(this.thumbHeight, 12);
    return y >= this.thumbTop && y <= this.thumbTop + grabHeight
      ? y - this.thumbTop
      : null;
  }

  /** Drag the thumb so its grabbed point follows an overlay-local y. */
  dragTo(y: number, grabOffset: number): void {
    const travel = this.trackHeight - this.thumbHeight;
    const ratio = travel <= 0 ? 0 : (y - grabOffset) / travel;
    this.bank.setScrollOffset(ratio * this.bank.maxScrollOffset);
  }
}
