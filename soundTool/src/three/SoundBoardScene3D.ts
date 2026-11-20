import {
  Container3D,
  ContainerTexture,
  CubeGeometry,
  DirectionalLight,
  Material3D,
  Mesh3D,
  PlaneGeometry,
  View3D,
} from '@pixi/3d';
import type { FederatedPointerEvent, PointData, Renderer, Texture } from 'pixi.js';
import { valueTowardPoint } from '../ui/knobTurn';
import { WaveformButton } from '../WaveformButton';
import { PixelButton, BUTTON_TONES } from '../ui/PixelButton';
import { KnobCap } from '../ui/PixelKnob';
import { PresetPad, type PresetTextures } from '../PresetPad';
import { RunButton } from '../RunButton';
import { ScrollArrowButton } from '../SoundBankPanel';
import { SoundBoardFrame } from '../SoundBoardFrame';
import type { TabIconTextures } from '../SoundBoardTabs';
import { Button3D } from './Button3D';
import { Knob3D } from './Knob3D';
import { BOARD_WIDTH, BOARD_HEIGHT, CABINET_DEPTH, boardToWorld } from './boardSpace';
import {
  PRESET_PADS,
  RUN_BUTTON,
  SCROLL_ARROWS,
  STRIP_KNOBS,
  TRANSPORT_BUTTONS,
  WAVEFORM_BUTTONS,
  type ControlRect,
} from './controlLayout';

const FACE_RESOLUTION = 3; // Captures the 512-wide design at the canvas's 1536 pixels.

/**
 * The sound board as a 3D scene: a cabinet body with the flat board artwork
 * on its front face, and every button and dial as a real 3D mesh carrying its
 * 2D artwork.
 */
export class SoundBoardScene3D extends Container3D {
  private readonly knobs: { rotor: Knob3D; cx: number; cy: number }[] = [];

  constructor(
    renderer: Renderer,
    presetTextures: PresetTextures,
    mascotTexture: Texture,
    tabIconTextures: TabIconTextures,
  ) {
    super();
    this.addChild(createCabinet(renderer, presetTextures, mascotTexture, tabIconTextures));
    this.addChild(...this.createControls(renderer, presetTextures));
    this.addChild(createKeyLight());
  }

  /**
   * Dial drags: a pressed rotor follows the pointer around its center until
   * release, tracked on the view so the drag survives leaving the dial.
   */
  bindPointer(view: View3D): void {
    this.knobs.forEach(({ rotor, cx, cy }) => {
      const turnToward = (global: PointData): void => {
        const ray = view.screenToRay(global);
        // Meet the pointer ray with the board plane (z = 0), then to board pixels.
        const t = -ray.origin.z / ray.direction.z;
        const worldX = ray.origin.x + t * ray.direction.x;
        const worldY = ray.origin.y + t * ray.direction.y;
        rotor.setValue(valueTowardPoint(cx, cy, worldX + BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - worldY, NEEDLE_START_ANGLE));
      };
      rotor.on('pointerdown', (event) => {
        const move = (e: FederatedPointerEvent): void => turnToward(e.global);
        const end = (): void => {
          view.off('pointermove', move);
          view.off('pointerup', end);
          view.off('pointerupoutside', end);
          view.off('pointercancel', end);
        };
        view.on('pointermove', move);
        view.on('pointerup', end);
        view.on('pointerupoutside', end);
        view.on('pointercancel', end);
        turnToward(event.global);
      });
    });
  }

  private createControls(renderer: Renderer, presetTextures: PresetTextures): Container3D[] {
    const controls: Container3D[] = [];

    TRANSPORT_BUTTONS.forEach(({ icon, tone, ...rect }) => {
      controls.push(place(new Button3D({
        face: new PixelButton(icon, tone, false, rect.width, rect.height),
        ...rect,
        bodyColor: BUTTON_TONES[tone].bottom,
        renderer,
      }), rect));
    });

    PRESET_PADS.forEach(({ icon, selected, ...rect }) => {
      controls.push(place(new Button3D({
        face: new PresetPad(icon, presetTextures, selected),
        ...rect,
        facePadding: 3, // The selected pad's selection ring spills 3px past its face.
        bodyColor: selected ? 0xe0607f : 0xe87d50,
        renderer,
      }), rect));
    });

    WAVEFORM_BUTTONS.forEach(({ type, selected, ...rect }) => {
      controls.push(place(new Button3D({
        face: new WaveformButton(type, selected),
        ...rect,
        facePadding: 3, // The selected button's selection ring spills 3px past its face.
        bodyColor: 0x7a53a8,
        renderer,
      }), rect));
    });

    controls.push(place(new Button3D({
      face: new RunButton(),
      ...RUN_BUTTON,
      depth: 6,
      bodyColor: 0x8e2b4a,
      renderer,
    }), RUN_BUTTON));

    SCROLL_ARROWS.forEach(({ up, ...rect }) => {
      controls.push(place(new Button3D({
        face: new ScrollArrowButton(up),
        ...rect,
        depth: 4,
        bodyColor: 0x8a63a0,
        renderer,
      }), rect));
    });

    STRIP_KNOBS.forEach((knob) => {
      const rotor = createKnob(renderer, knob);
      this.knobs.push({ rotor, cx: knob.cx, cy: knob.cy });
      controls.push(rotor);
    });

    return controls;
  }
}

/** Sweep start of the cap needle artwork: the 3D dial's minimum sits down-right. */
const NEEDLE_START_ANGLE = Math.PI * 0.25;

function createCabinet(
  renderer: Renderer,
  presetTextures: PresetTextures,
  mascotTexture: Texture,
  tabIconTextures: TabIconTextures,
): Container3D {
  const cabinet = new Container3D();

  const body = new Mesh3D({
    geometry: new CubeGeometry({ width: BOARD_WIDTH, height: BOARD_HEIGHT, depth: CABINET_DEPTH }),
    material: new Material3D({ baseColor: 0x4d2c71, roughness: 0.7 }),
  });
  body.position.z = -CABINET_DEPTH / 2;

  // Every flat surface of the board - frame art, header, tabs, panels,
  // waveform, bank rows, footer and dial markings - drawn onto the front.
  const flatBoard = new SoundBoardFrame(presetTextures, mascotTexture, tabIconTextures, '3d');
  const faceTexture = new ContainerTexture({
    container: flatBoard,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    resolution: FACE_RESOLUTION,
    renderer,
  });
  const face = new Mesh3D({
    geometry: new PlaneGeometry({ width: BOARD_WIDTH, height: BOARD_HEIGHT }),
    material: new Material3D({ baseColorTexture: faceTexture, roughness: 0.9 }),
    castShadow: false,
  });
  face.position.z = 0.5;

  cabinet.addChild(body, face);
  return cabinet;
}

function createKnob(
  renderer: Renderer,
  knob: { cx: number; cy: number; value: number; color: number; radius: number },
): Knob3D {
  const rotor = new Knob3D({
    cap: new KnobCap(knob.value, knob.color, { x: 16, y: 16 }),
    value: knob.value,
    radius: knob.radius,
    depth: 7,
    renderer,
  });
  const { x, y } = boardToWorld(knob.cx, knob.cy);
  rotor.position.set(x, y, 0);
  return rotor;
}

/** Center a control on its face rectangle, on top of the board's front face. */
function place<T extends Container3D>(control: T, rect: ControlRect): T {
  const { x, y } = boardToWorld(rect.x + rect.width / 2, rect.y + rect.height / 2);
  control.position.set(x, y, 0);
  return control;
}

function createKeyLight(): DirectionalLight {
  const light = new DirectionalLight({ color: 0xfff4e0, intensity: 1.6, castShadow: true });
  light.position.set(-140, 220, 320);
  light.lookAt({ x: 0, y: 0, z: 0 });
  return light;
}
