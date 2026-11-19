import { Container, Graphics, Text } from 'pixi.js';
import { PixelButton } from './ui/PixelButton';

const HEADER_HEIGHT = 28;
const TEXT_COLOR = 0xffeaff;

/** Title/status strip with separate logo, sound meter, clock, and RUN control. */
export class SoundBoardHeader extends Container {
  constructor(width: number) {
    super();
    this.addChild(drawHeader(width));
    this.addChild(createLogo());
    this.addChild(createTitle());
    this.addChild(createSpeaker(width));
    this.addChild(createLevelMeter(width));
    this.addChild(createClock(width));
    this.addChild(createRunButton(width));
  }
}

function drawHeader(width: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, HEADER_HEIGHT).fill(0x45285c)
    .rect(0, 0, width, 2).fill(0xc276d7)
    .rect(0, HEADER_HEIGHT - 2, width, 2).fill(0x281635)
    .rect(4, 4, width - 8, HEADER_HEIGHT - 8).stroke({ color: 0x79468f, width: 2 });
}

function createLogo(): Container {
  const logo = new Container();
  const art = new Graphics()
    .rect(8, 0, 32, 32).fill(0x321b47)
    .rect(8, 0, 32, 2).fill(0xe08be9)
    .rect(8, 30, 32, 2).fill(0x281635)
    .rect(16, 2, 4, 12).fill(0xff91c8)
    .rect(28, 2, 4, 12).fill(0xff91c8)
    .rect(16, 4, 4, 4).fill(0xffcf72)
    .rect(28, 4, 4, 4).fill(0xffcf72)
    .rect(16, 12, 16, 16).fill(0xff91c8)
    .rect(20, 18, 2, 2).fill(0x321b47)
    .rect(26, 18, 2, 2).fill(0x321b47)
    .rect(22, 24, 4, 2).fill(0xffcf72);
  logo.addChild(art);
  logo.scale.set(0.75);
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

function createSpeaker(width: number): Container {
  const speaker = new Container();
  const icon = new Text({
    text: '◖',
    style: { fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', fill: 0x8fe28b },
  });
  icon.position.set(0, 8);
  const waves = new Graphics()
    .arc(10, 16, 8, -0.8, 0.8).stroke({ color: 0x8fe28b, width: 2 })
    .arc(10, 16, 12, -0.8, 0.8).stroke({ color: 0x8fe28b, width: 2 });
  speaker.position.x = width - 232;
  speaker.addChild(icon, waves);
  return speaker;
}

function createLevelMeter(width: number): Graphics {
  const levels = [8, 12, 16, 16, 16, 16, 12, 8];
  const meter = new Graphics()
    .rect(width - 200, 6, 64, 20).fill(0x281635)
    .rect(width - 198, 8, 60, 16).stroke({ color: 0x79468f, width: 2 });
  levels.forEach((height, index) => {
    meter.rect(width - 192 + index * 8, 24 - height, 4, height)
      .fill(index < 5 ? 0xff91c8 : 0x513366);
  });
  return meter;
}

function createClock(width: number): Text {
  const clock = new Text({
    text: 'SAT 14:20',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: TEXT_COLOR },
  });
  clock.position.set(width - 120, 12);
  return clock;
}

function createRunButton(width: number): PixelButton {
  const button = new PixelButton('RUN', 'pink');
  button.position.set(width - 40, 0);
  return button;
}
