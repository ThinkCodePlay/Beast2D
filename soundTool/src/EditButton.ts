import { Container, Graphics, Text } from 'pixi.js';
import { chamferPoints } from './ui/GradientFace';

export const EDIT_WIDTH = 62;
export const EDIT_HEIGHT = 42;

/** Wide stepped waveform-edit button with a beveled face and built-in label. */
export class EditButton extends Container {
  constructor() {
    super();
    this.addChild(drawEditFace());
    this.addChild(drawWaveformMark());
    this.addChild(createLabel());
  }
}

function drawEditFace(): Graphics {
  const cut = chamferPoints;
  return new Graphics()
    .poly(cut(3, 4, EDIT_WIDTH, EDIT_HEIGHT, 5)).fill(0x170d21)
    .poly(cut(0, 0, EDIT_WIDTH, EDIT_HEIGHT, 5)).fill(0x24152e)
    .poly(cut(2, 2, EDIT_WIDTH - 4, EDIT_HEIGHT - 4, 4)).fill(0xb58fd0)
    .poly(cut(3, 3, EDIT_WIDTH - 6, EDIT_HEIGHT - 6, 3)).fill(0x8b68a2)
    .rect(6, 4, EDIT_WIDTH - 12, 6).fill({ color: 0xd8b8e8, alpha: 0.5 })
    .rect(4, 3, 2, 2).fill(0xffffff)
    .rect(EDIT_WIDTH - 6, 3, 2, 2).fill(0xffffff)
    .rect(4, EDIT_HEIGHT - 5, 2, 2).fill({ color: 0xffffff, alpha: 0.7 })
    .rect(EDIT_WIDTH - 6, EDIT_HEIGHT - 5, 2, 2).fill({ color: 0xffffff, alpha: 0.7 });
}

function drawWaveformMark(): Graphics {
  const wave = new Graphics();
  // Reference mark: alternating trace - flat baseline, peak, deep central
  // trough crossing below the baseline, second peak, back to baseline.
  const path: [number, number][] = [
    [10, 12], [20, 12], [23, 6], [24.2, 5], [25.5, 6.8], [27.4, 13.8], [28.3, 19],
    [29.2, 13.8], [31, 6.8], [32.4, 5], [33.7, 6], [36.5, 12], [52, 12],
  ];
  const trace = (offsetY: number, color: number, width: number): void => {
    wave.moveTo(path[0][0], path[0][1] + offsetY);
    path.slice(1).forEach(([x, y]) => wave.lineTo(x, y + offsetY));
    wave.stroke({ color, width, cap: 'square', join: 'round' });
  };
  trace(1, 0x3a2046, 4);
  trace(0, 0xf6ba68, 2.5);
  trace(-1, 0xffe0a8, 1);
  return wave;
}

function createLabel(): Text {
  const label = new Text({
    text: 'EDIT',
    style: { fontFamily: 'monogram', fontSize: 12, fontWeight: 'bold', fill: 0xedb571 }, resolution: 3,
  });
  label.anchor.set(0.5, 0);
  label.position.set(EDIT_WIDTH / 2, 27);
  return label;
}
