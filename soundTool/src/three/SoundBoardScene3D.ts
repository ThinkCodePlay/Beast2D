import {
  Container3D,
  ContainerTexture,
  CubeGeometry,
  DirectionalLight,
  Material3D,
  Mesh3D,
  PlaneGeometry,
} from '@pixi/3d';
import type { Renderer, Texture } from 'pixi.js';
import { EditButton } from '../EditButton';
import { PixelButton, BUTTON_TONES } from '../ui/PixelButton';
import { KnobCap, type KnobVariant } from '../ui/PixelKnob';
import { PresetPad, type PresetTextures } from '../PresetPad';
import { RunButton } from '../RunButton';
import { ScrollArrowButton } from '../SoundBankPanel';
import { SoundBoardFrame } from '../SoundBoardFrame';
import type { TabIconTextures } from '../SoundBoardTabs';
import { Button3D } from './Button3D';
import { Knob3D } from './Knob3D';
import { BOARD_WIDTH, BOARD_HEIGHT, CABINET_DEPTH, boardToWorld } from './boardSpace';
import {
  EDIT_BUTTON,
  MASTER_KNOB,
  PRESET_PADS,
  RUN_BUTTON,
  SCROLL_ARROWS,
  STRIP_KNOBS,
  TRANSPORT_BUTTONS,
  type ControlRect,
} from './controlLayout';

const FACE_RESOLUTION = 3; // Captures the 512-wide design at the canvas's 1536 pixels.

/**
 * The sound board as a 3D scene: a cabinet body with the flat board artwork
 * on its front face, and every button and dial as a real 3D mesh carrying its
 * 2D artwork.
 */
export class SoundBoardScene3D extends Container3D {
  constructor(
    renderer: Renderer,
    presetTextures: PresetTextures,
    mascotTexture: Texture,
    tabIconTextures: TabIconTextures,
  ) {
    super();
    this.addChild(createCabinet(renderer, presetTextures, mascotTexture, tabIconTextures));
    this.addChild(...createControls(renderer, presetTextures));
    this.addChild(createKeyLight());
  }
}

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
  face.position.z = 0.05;

  cabinet.addChild(body, face);
  return cabinet;
}

function createControls(renderer: Renderer, presetTextures: PresetTextures): Container3D[] {
  const controls: Container3D[] = [];

  TRANSPORT_BUTTONS.forEach(({ icon, tone, ...rect }) => {
    controls.push(place(new Button3D({
      face: new PixelButton(icon, tone),
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

  controls.push(place(new Button3D({
    face: new EditButton(),
    ...EDIT_BUTTON,
    bodyColor: 0x8b68a2,
    renderer,
  }), EDIT_BUTTON));

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

  controls.push(createKnob(renderer, MASTER_KNOB, 'master'));
  STRIP_KNOBS.forEach((knob) => controls.push(createKnob(renderer, knob, 'standard')));

  return controls;
}

function createKnob(
  renderer: Renderer,
  knob: { cx: number; cy: number; value: number; color: number; radius: number },
  variant: KnobVariant,
): Knob3D {
  const rotor = new Knob3D({
    cap: new KnobCap(knob.value, knob.color, variant, { x: 16, y: 16 }),
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
