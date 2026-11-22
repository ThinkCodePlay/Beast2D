import {
  Container3D,
  ContainerTexture,
  FlatMaterial,
  Mesh3D,
  PlaneGeometry,
} from "@pixi/3d";
import type { Renderer } from "pixi.js";
import type { SoundBank } from "../../shared/bank";
import { BankRows } from "../../shared/components/BankRows";
import type { ControlRect } from "./controlLayout";

/** World z of the overlay face: just above the cabinet's front face. */
const OVERLAY_FACE_Z = 0.7;

/**
 * The 3D scene's sound-bank rows: the shared rows drawn onto a flat overlay
 * on the cabinet face, re-rendered whenever the selection changes. The scene
 * hit-tests this mesh and maps the tap through slotAt to select a slot.
 */
export class BankRows3D extends Container3D {
  /** The shared rows, kept for tap mapping. */
  readonly rows: BankRows;

  constructor(rect: ControlRect, renderer: Renderer, bank: SoundBank) {
    super();
    // The rows' 4px left offset is part of the captured area (rect covers it).
    this.rows = new BankRows(bank, rect.width - 4, false);
    const faceTexture = new ContainerTexture({
      container: this.rows,
      width: rect.width,
      height: rect.height,
      resolution: 3,
      renderer,
    });
    const face = new Mesh3D({
      geometry: new PlaneGeometry({ width: rect.width, height: rect.height }),
      material: new FlatMaterial({
        baseColorTexture: faceTexture,
        alphaMode: "blend",
      }),
      castShadow: false,
      receiveShadow: false,
    });
    face.position.z = OVERLAY_FACE_Z;
    this.addChild(face);
    this.eventMode = "static";
    this.cursor = "pointer";
    bank.onChange(() => faceTexture.render());
  }
}
