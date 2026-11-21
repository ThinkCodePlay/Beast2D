import { Container, Graphics } from 'pixi.js';
import { chamferPoints, drawGradientFace } from './ui/GradientFace';
import type { WaveformType } from './audio/model';
import { makePressable } from './ui/Pressable';

export const WAVEFORM_BUTTON_WIDTH = 45;
export const WAVEFORM_BUTTON_HEIGHT = 30;

const ICON_WIDTH = 31;
const ICON_HEIGHT = 16;

/** Purple waveform-choice button with a gold trace of its oscillator shape. */
export class WaveformButton extends Container {
  private face: Graphics;

  constructor(
    readonly type: WaveformType,
    selected = false,
    private readonly buttonWidth = WAVEFORM_BUTTON_WIDTH,
    private readonly buttonHeight = WAVEFORM_BUTTON_HEIGHT,
  ) {
    super();
    this.face = drawButtonFace(selected, buttonWidth, buttonHeight);
    this.addChild(this.face);
    const icon = drawWaveformIcon(type);
    icon.position.set((buttonWidth - ICON_WIDTH) / 2, (buttonHeight - ICON_HEIGHT) / 2);
    this.addChild(icon);
    makePressable(this);
  }

  /** Show or hide the pink selection ring. */
  setSelected(selected: boolean): void {
    this.face.clear();
    drawButtonFace(selected, this.buttonWidth, this.buttonHeight, this.face);
  }
}

function drawButtonFace(selected: boolean, width: number, height: number, face = new Graphics()): Graphics {
  if (selected) {
    // Same pink selection perimeter as the preset pads.
    face
      .poly(chamferPoints(-3, -3, width + 6, height + 6, 5)).fill(0xff9ec2)
      .poly(chamferPoints(-1.5, -1.5, width + 3, height + 3, 4)).fill(0xe95186);
  }
  drawGradientFace(face, 0, 0, width, height, 4, {
    edge: 0x24152e,
    top: 0xd8b8ec,
    mid: 0x9a6cc8,
    bottom: 0x7a53a8,
  }, 0.68, 4);
  face.rect(4, height - 3.5, width - 8, 1).fill(0x5a3a78);
  return face;
}

/** Trace points for each waveform inside the shared icon box. */
const WAVEFORM_PATHS: Record<WaveformType, [number, number][]> = {
  sine: Array.from({ length: 21 }, (_, i) => [i * 1.5, 8 + Math.sin((i / 20) * Math.PI * 3) * 5.5] as [number, number]),
  square: [[0, 12], [4, 12], [4, 4], [11, 4], [11, 12], [19, 12], [19, 4], [26, 4], [26, 12], [31, 12]],
  saw: [[0, 13], [9, 4], [9, 13], [18, 4], [18, 13], [27, 4], [27, 13]],
  triangle: [[0, 12], [5, 4], [10, 12], [15, 4], [20, 12], [25, 4], [30, 12]],
  noise: [[0, 10], [3, 5], [5, 12], [8, 4], [10, 13], [13, 6], [15, 11], [18, 3], [20, 12], [23, 6], [25, 13], [28, 7], [31, 10]],
  pulse: [[0, 12], [9, 12], [9, 3], [14, 3], [14, 12], [31, 12]],
};

/** Gold trace with a dark under-stroke, the same recipe as the edit mark. */
function drawWaveformIcon(type: WaveformType): Graphics {
  const path = WAVEFORM_PATHS[type];
  const icon = new Graphics();
  const trace = (offsetY: number, color: number, width: number): void => {
    icon.moveTo(path[0][0], path[0][1] + offsetY);
    path.slice(1).forEach(([x, y]) => icon.lineTo(x, y + offsetY));
    icon.stroke({ color, width, cap: 'square', join: 'round' });
  };
  trace(1, 0x3a2046, 3.5);
  trace(0, 0xf6ba68, 2);
  trace(-1, 0xffe0a8, 1);
  return icon;
}
