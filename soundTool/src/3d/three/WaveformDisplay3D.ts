import { Container3D, ContainerTexture, CubeGeometry, FlatMaterial, Material3D, Mesh3D, PlaneGeometry } from '@pixi/3d';
import type { Renderer } from 'pixi.js';
import type { SoundSequence } from '../../shared/audio/model';
import { WaveformDisplay } from '../../shared/ui/WaveformDisplay';
import type { ControlRect } from './controlLayout';

const BODY_DEPTH = 2;
/** World z of the display's face: the body top plus its small air gap. */
export const WAVEFORM_FACE_Z = BODY_DEPTH + 0.2;

/**
 * The 3D scene's waveform display: the same editable display the 2D board
 * uses, drawn live onto a shallow body on the cabinet face. Drags paint
 * through the shared display's paintAt, so pitch and volume edits behave
 * exactly like the 2D board.
 */
export class WaveformDisplay3D extends Container3D {
  /** The shared editable display, kept for drag painting. */
  readonly display: WaveformDisplay;

  constructor(
    rect: ControlRect,
    renderer: Renderer,
    sequence: SoundSequence,
    onNoteChange?: (index: number) => void,
    onVolumeChange?: (index: number) => void,
  ) {
    super();
    this.display = new WaveformDisplay(rect.width, rect.height, sequence, onNoteChange, onVolumeChange);

    const body = new Mesh3D({
      geometry: new CubeGeometry({ width: rect.width, height: rect.height, depth: BODY_DEPTH }),
      material: new Material3D({ baseColor: 0x21132b, roughness: 0.9 }),
    });
    body.position.z = BODY_DEPTH / 2;

    const faceTexture = new ContainerTexture({
      container: this.display,
      width: rect.width,
      height: rect.height,
      resolution: 3,
      renderer,
      autoUpdate: true, // Re-drawn every frame so painted steps show immediately.
    });
    const face = new Mesh3D({
      geometry: new PlaneGeometry({ width: rect.width, height: rect.height }),
      material: new FlatMaterial({ baseColorTexture: faceTexture, alphaMode: 'blend' }),
      castShadow: false,
      receiveShadow: false,
    });
    face.position.z = WAVEFORM_FACE_Z;

    this.addChild(body, face);
    this.eventMode = 'static';
    this.cursor = 'pointer';
  }
}
