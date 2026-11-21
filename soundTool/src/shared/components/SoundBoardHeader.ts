import { Container, Graphics, Sprite, Text, type Texture } from 'pixi.js';
import { RunButton } from './RunButton';
import type { ControlMode } from '../controls';

const HEADER_HEIGHT = 24;
const TEXT_COLOR = 0xffeaff;

/** Where the RUN badge sits, measured from the header's right edge. */
export const RUN_RIGHT_INSET = 34;

/** Title/status strip with separate logo, sound meter, clock, and RUN control. */
export class SoundBoardHeader extends Container {
  constructor(width: number, mascotTexture: Texture, controls: ControlMode = '2d') {
    super();
    this.addChild(drawHeader(width));
    this.addChild(drawAppIcon());
    this.addChild(createLogo(mascotTexture));
    this.addChild(createTitle());
    this.addChild(createSpeaker(width));
    this.addChild(createLevelMeter(width));
    this.addChild(createClock(width));
    if (controls === '2d') {
      const run = new RunButton();
      run.position.set(width - RUN_RIGHT_INSET, -1.5);
      this.addChild(run);
    }
  }
}

function drawHeader(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, HEADER_HEIGHT).fill(0x45285c)
    .rect(0, 0, width, 2).fill(0xc276d7)
    .rect(0, HEADER_HEIGHT - 2, width, 2).fill(0x281635)
    .rect(4, 4, width - 8, HEADER_HEIGHT - 8).stroke({ color: 0x79468f, width: 1 });
}

function drawAppIcon(): Graphics {
  return new Graphics()
    .roundRect(4, 2.3, 5.3, 6.3, 1.2).fill(0xf3819b)
    .roundRect(5.2, 3.4, 2, 2, 0.7).fill(0xfdb9ce);
}

function createLogo(texture: Texture): Sprite {
  const logo = new Sprite(texture);
  logo.width = 24;
  logo.height = 27;
  logo.position.set(14, -2.7);
  return logo;
}

function createTitle(): Text {
  const title = new Text({
    text: 'beast2d sound board',
    style: { fontFamily: 'monogram', fontSize: 19, fontWeight: 'bold', letterSpacing: 1, fill: TEXT_COLOR, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
  });
  title.position.set(47, -3);
  return title;
}

function createSpeaker(width: number): Container {
  const speaker = new Container();
  const icon = new Graphics()
    .rect(0, 7, 3, 6).fill(0x8fe28b)
    .poly([3, 7, 8, 3, 8, 17, 3, 13]).fill(0x8fe28b);
  const waves = new Graphics()
    .arc(9, 10, 3.5, -0.9, 0.9).stroke({ color: 0x8fe28b, width: 1.5 })
    .arc(9, 10, 6, -0.9, 0.9).stroke({ color: 0x8fe28b, width: 1.5 });
  speaker.position.set(width - 186, 0.5);
  speaker.addChild(icon, waves);
  return speaker;
}

const METER_LIT_COLORS = [0xf490c6, 0xfa8cd3, 0xdc6fec, 0xb574f4, 0xaa72fb, 0xa564f6] as const;
const METER_BAR_COUNT = 10;
const METER_UNLIT = 0x5c3590;

function createLevelMeter(width: number): Graphics {
  const meter = new Graphics()
    .roundRect(width - 158, 11 / 3, 64, 12.67, 2).fill(0x281635)
    .roundRect(width - 157, 14 / 3, 62, 10.67, 1).stroke({ color: 0x79468f, width: 1 });
  for (let index = 0; index < METER_BAR_COUNT; index += 1) {
    const color = index < METER_LIT_COLORS.length ? METER_LIT_COLORS[index] : METER_UNLIT;
    meter.rect(width - 154 + index * 5.67, 6, 4.33, 9.33).fill(color);
  }
  return meter;
}

function createClock(width: number): Text {
  const clock = new Text({
    text: 'SAT 14:20',
    style: { fontFamily: 'monogram', fontSize: 15, fontWeight: 'bold', fill: TEXT_COLOR }, resolution: 3,
  });
  clock.position.set(width - 88, 1);
  return clock;
}

