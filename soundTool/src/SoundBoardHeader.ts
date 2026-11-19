import { Container, Graphics, Text } from 'pixi.js';
import { PixelButton } from './ui/PixelButton';

const HEADER_HEIGHT = 32;
const TEXT_COLOR = 0xffeaff;

/** Title/status bar for the fixed 480×320 sound-board display. */
export class SoundBoardHeader extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawHeader(width));
    this.addChild(createLogo());
    this.addChild(createTitle());
    this.addChild(createSpeaker());
    this.addChild(createLevelMeter());
    this.addChild(createClock());
    this.addChild(createRunButton(width));
  }
}

function drawHeader(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, HEADER_HEIGHT)
    .fill(0x45285c)
    .rect(0, 0, width, 2)
    .fill(0xc276d7)
    .rect(0, HEADER_HEIGHT - 2, width, 2)
    .fill(0x281635)
    .rect(4, 4, width - 8, HEADER_HEIGHT - 8)
    .stroke({ color: 0x79468f, width: 2 });
}

function createLogo(): Container {
  const logo = new Container();
  const mark = new Graphics()
    .rect(8, 0, 32, 32)
    .fill(0x321b47)
    .rect(8, 0, 32, 2)
    .fill(0xe08be9)
    .rect(8, 30, 32, 2)
    .fill(0x281635)
    .rect(16, 2, 4, 12)
    .fill(0xff91c8)
    .rect(28, 2, 4, 12)
    .fill(0xff91c8)
    .rect(16, 4, 4, 4)
    .fill(0xffcf72)
    .rect(28, 4, 4, 4)
    .fill(0xffcf72)
    .rect(16, 12, 16, 16)
    .fill(0xff91c8)
    .rect(20, 18, 2, 2)
    .fill(0x321b47)
    .rect(26, 18, 2, 2)
    .fill(0x321b47)
    .rect(22, 24, 4, 2)
    .fill(0xffcf72);
  logo.addChild(mark);
  return logo;
}

function createTitle(): Text {
  const title = new Text({
    text: 'beast2d sound board',
    style: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', fill: TEXT_COLOR },
  });
  title.position.set(48, 8);
  return title;
}

function createSpeaker(): Text {
  const speaker = new Text({
    text: '◖',
    style: { fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', fill: 0x8fe28b },
  });
  speaker.position.set(224, 8);
  return speaker;
}

function createLevelMeter(): Graphics {
  const levels = [8, 12, 16, 16, 16, 16, 12, 8];
  const meter = new Graphics();
  levels.forEach((height, index) => {
    meter.rect(248 + index * 8, 24 - height, 4, height).fill(index < 5 ? 0xff91c8 : 0x513366);
  });
  return meter;
}

function createClock(): Text {
  const clock = new Text({
    text: 'SAT 14:20',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: TEXT_COLOR },
  });
  clock.position.set(320, 12);
  return clock;
}

function createRunButton(width: number): PixelButton {
  const button = new PixelButton('RUN', 'pink');
  button.position.set(width - 40, 0);
  return button;
}
