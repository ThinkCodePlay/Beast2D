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
import type { SoundSequence, WaveformType } from '../../shared/audio/model';
import { MAX_NAME_LENGTH, type SoundBank } from '../../shared/bank';
import { canvasRectToCss, openNameEditor } from '../../shared/ui/nameEditor';
import type { TransportActions } from '../../shared/transport';
import { applyDial, dialSnap, dialValue, type KnobLabel } from '../../shared/dials';
import { valueTowardPoint } from '../../shared/ui/knobTurn';
import { drawSelectionRing, WaveformButton } from '../../shared/components/WaveformButton';
import { PixelButton, BUTTON_TONES } from '../../shared/ui/PixelButton';
import { KnobCap } from '../../shared/ui/PixelKnob';
import { PresetPad, type PresetTextures } from '../../shared/components/PresetPad';
import { RunButton } from '../../shared/components/RunButton';
import { ScrollArrowButton } from '../../shared/components/SoundBankPanel';
import { SoundBoardFrame } from '../../shared/components/SoundBoardFrame';
import type { TabIconTextures } from '../../shared/components/SoundBoardTabs';
import { Button3D } from './Button3D';
import { Knob3D } from './Knob3D';
import { BOARD_WIDTH, BOARD_HEIGHT, CABINET_DEPTH, boardToWorld } from './boardSpace';
import {
  BANK_ROWS_AREA,
  LCD_DISPLAY,
  PRESET_PADS,
  RUN_BUTTON,
  SCROLL_ARROWS,
  STRIP_KNOBS,
  TRANSPORT_BUTTONS,
  WAVEFORM_BUTTONS,
  WAVEFORM_DISPLAY,
  type ControlRect,
} from './controlLayout';
import { BankRows3D } from './BankRows3D';
import { LcdDisplay3D } from './LcdDisplay3D';
import { WAVEFORM_FACE_Z, WaveformDisplay3D } from './WaveformDisplay3D';

const FACE_RESOLUTION = 3; // Captures the 512-wide design at the canvas's 1536 pixels.
/** World z of the flat live overlays (LCD, bank rows), just above the cabinet face. */
const OVERLAY_WORLD_Z = 0.7;

/**
 * The sound board as a 3D scene: a cabinet body with the flat board artwork
 * on its front face, and every button and dial as a real 3D mesh carrying its
 * 2D artwork.
 */
export class SoundBoardScene3D extends Container3D {
  private readonly knobs: { rotor: Knob3D; cx: number; cy: number; label: KnobLabel }[] = [];
  private waveformButtons: { type: WaveformType; button: Button3D }[] = [];
  private waveform?: WaveformDisplay3D;
  private bankRows?: BankRows3D;
  private lcd?: LcdDisplay3D;

  constructor(
    renderer: Renderer,
    presetTextures: PresetTextures,
    mascotTexture: Texture,
    tabIconTextures: TabIconTextures,
    private readonly sequence: SoundSequence,
    private readonly bank: SoundBank,
    private readonly transport: TransportActions,
  ) {
    super();
    this.addChild(createCabinet(renderer, presetTextures, mascotTexture, tabIconTextures, sequence));
    this.addChild(...this.createControls(renderer, presetTextures));
    this.addChild(createKeyLight());
    bank.onChange(() => this.refreshFromSequence());
  }

  /**
   * Re-read the sequence after a bank slot switch: rotors point at the new
   * slot's dial values, the waveform ring and display follow, and the live
   * dials re-apply to the player so what you hear matches the slot.
   */
  private refreshFromSequence(): void {
    this.knobs.forEach(({ rotor, label }) => rotor.setValue(dialValue(label, this.sequence)));
    this.waveformButtons.forEach(({ type, button }) => button.setSelected(type === this.sequence.waveform));
    this.waveform?.display.refresh();
    this.transport.setMasterVolume(this.sequence.masterVolume);
    this.transport.setPan(this.sequence.pan);
    this.transport.setCutoff(this.sequence.cut);
  }

  /**
   * Dial drags: a pressed rotor follows the pointer around its center until
   * release, tracked on the view so the drag survives leaving the dial.
   * Waveform drags paint steps the same way, routed through the display.
   */
  bindPointer(view: View3D): void {
    this.bindWaveformPaint(view);
    // Bank rows: a tap selects the tapped slot (empty slots ignore it).
    this.bankRows?.on('pointertap', (event) => {
      const { y } = this.boardPoint(view, event.global);
      this.bank.select(this.bankRows!.rows.slotAt(y - BANK_ROWS_AREA.y));
    });
    // LCD: a tap opens the name editor over the LCD's on-screen rectangle.
    this.lcd?.on('pointertap', () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const rect = this.screenRect(view, LCD_DISPLAY);
      if (!rect) return;
      openNameEditor(canvasRectToCss(canvas, rect), {
        value: this.bank.selectedName,
        maxLength: MAX_NAME_LENGTH,
        onCommit: name => this.bank.rename(name),
      });
    });
    this.knobs.forEach(({ rotor, cx, cy, label }) => {
      const turnToward = (global: PointData): void => {
        const ray = view.screenToRay(global);
        // Meet the pointer ray with the board plane (z = 0), then to board pixels.
        const t = -ray.origin.z / ray.direction.z;
        const worldX = ray.origin.x + t * ray.direction.x;
        const worldY = ray.origin.y + t * ray.direction.y;
        const value = valueTowardPoint(cx, cy, worldX + BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - worldY, NEEDLE_START_ANGLE);
        rotor.setValue(dialSnap(label)?.(value) ?? value);
        this.applyDial(label, rotor.getValue());
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

  /** Write a rotor's turn into the sequence; live dials also reach the player. */
  private applyDial(label: KnobLabel, value: number): void {
    applyDial(label, value, this.sequence, this.transport);
  }

  /** Meet the pointer ray with the board plane (z = 0), in board-design pixels. */
  private boardPoint(view: View3D, global: PointData): { x: number; y: number } {
    const ray = view.screenToRay(global);
    const t = -ray.origin.z / ray.direction.z;
    return {
      x: ray.origin.x + t * ray.direction.x + BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2 - (ray.origin.y + t * ray.direction.y),
    };
  }

  /** A board-design rectangle's bounds in pixi screen space, or null behind the camera. */
  private screenRect(view: View3D, rect: ControlRect): { x: number; y: number; width: number; height: number } | null {
    const corners = [
      boardToWorld(rect.x, rect.y),
      boardToWorld(rect.x + rect.width, rect.y),
      boardToWorld(rect.x, rect.y + rect.height),
      boardToWorld(rect.x + rect.width, rect.y + rect.height),
    ].map(({ x, y }) => view.worldToScreen({ x, y, z: OVERLAY_WORLD_Z }));
    if (corners.some(corner => corner === null)) return null;
    const xs = corners.map(corner => corner!.x);
    const ys = corners.map(corner => corner!.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
  }

  private createControls(renderer: Renderer, presetTextures: PresetTextures): Container3D[] {
    const controls: Container3D[] = [];

    TRANSPORT_BUTTONS.forEach(({ icon, tone, ...rect }) => {
      const button = new Button3D({
        face: new PixelButton(icon, tone, false, rect.width, rect.height),
        ...rect,
        bodyColor: BUTTON_TONES[tone].bottom,
        renderer,
      });
      if (icon === '▶') button.on('pointertap', this.transport.play);
      if (icon === '■') button.on('pointertap', this.transport.stop);
      if (icon === '↻') button.on('pointertap', () => button.setLatched(this.transport.toggleLoop()));
      controls.push(place(button, rect));
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

    this.waveformButtons = WAVEFORM_BUTTONS.map(({ type, ...rect }) => {
      const button = new Button3D({
        face: new WaveformButton(type),
        ring: drawSelectionRing(rect.width, rect.height),
        ...rect,
        facePadding: 3, // The selection ring spills 3px past the face.
        bodyColor: 0x7a53a8,
        renderer,
      });
      button.setSelected(type === this.sequence.waveform);
      button.on('pointertap', () => {
        this.sequence.waveform = type;
        waveformButtons.forEach(other => other.button.setSelected(other.type === type));
      });
      controls.push(place(button, rect));
      return { type, button };
    });
    const waveformButtons = this.waveformButtons;

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
      const value = dialValue(knob.label, this.sequence);
      const rotor = createKnob(renderer, { ...knob, value });
      this.knobs.push({ rotor, cx: knob.cx, cy: knob.cy, label: knob.label });
      controls.push(rotor);
    });

    // Pitch and volume edits both audition the edited step.
    this.waveform = place(new WaveformDisplay3D(WAVEFORM_DISPLAY, renderer, this.sequence, this.transport.audition, this.transport.audition), WAVEFORM_DISPLAY);
    controls.push(this.waveform);

    // Live flat overlays: the name LCD and the selectable bank rows, left out
    // of the cabinet's baked face artwork so they can change with the bank.
    this.lcd = place(new LcdDisplay3D(LCD_DISPLAY, renderer, this.bank), LCD_DISPLAY);
    controls.push(this.lcd);
    this.bankRows = place(new BankRows3D(BANK_ROWS_AREA, renderer, this.bank), BANK_ROWS_AREA);
    controls.push(this.bankRows);

    return controls;
  }

  /**
   * Waveform painting: a press on the display paints steps as the pointer
   * moves, tracked on the view so the drag survives leaving the display. The
   * pointer ray meets the display's face plane, then converts to display-local
   * pixels for the shared paintAt.
   */
  private bindWaveformPaint(view: View3D): void {
    const waveform = this.waveform;
    if (!waveform) return;
    const paintAt = (global: PointData): void => {
      const ray = view.screenToRay(global);
      const t = (WAVEFORM_FACE_Z - ray.origin.z) / ray.direction.z;
      const x = ray.origin.x + t * ray.direction.x + BOARD_WIDTH / 2 - WAVEFORM_DISPLAY.x;
      const y = BOARD_HEIGHT / 2 - (ray.origin.y + t * ray.direction.y) - WAVEFORM_DISPLAY.y;
      waveform.display.paintAt(x, y);
    };
    waveform.on('pointerdown', (event) => {
      const move = (e: FederatedPointerEvent): void => paintAt(e.global);
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
      paintAt(event.global);
    });
  }
}

/** Sweep start of the cap needle artwork, matching the board's tick rings: minimum sits down-left. */
const NEEDLE_START_ANGLE = Math.PI * 0.75;

function createCabinet(
  renderer: Renderer,
  presetTextures: PresetTextures,
  mascotTexture: Texture,
  tabIconTextures: TabIconTextures,
  sequence: SoundSequence,
): Container3D {
  const cabinet = new Container3D();

  const body = new Mesh3D({
    geometry: new CubeGeometry({ width: BOARD_WIDTH, height: BOARD_HEIGHT, depth: CABINET_DEPTH }),
    material: new Material3D({ baseColor: 0x4d2c71, roughness: 0.7 }),
  });
  body.position.z = -CABINET_DEPTH / 2;

  // Every flat surface of the board - frame art, header, tabs, panels,
  // waveform, bank rows, footer and dial markings - drawn onto the front.
  const flatBoard = new SoundBoardFrame(presetTextures, mascotTexture, tabIconTextures, sequence, { controls: '3d' });
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
  knob: { label: string; cx: number; cy: number; value: number; color: number; radius: number },
): Knob3D {
  const rotor = new Knob3D({
    cap: new KnobCap(knob.value, knob.color, { x: 16, y: 16 }, NEEDLE_START_ANGLE),
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
