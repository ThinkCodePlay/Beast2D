import { Container, Graphics, Text } from 'pixi.js';

const HEADER_HEIGHT = 24;
const HEADER_ICON_SIZE = 16;
const HEADER_INSET_X = 8;
const HEADER_INSET_Y = 7;

/** Compact pixel-style title bar for the sound board cabinet. */
export class SoundBoardHeader extends Container {
  constructor(width: number, title = 'Beast2D Sound Board') {
    super();

    const barWidth = width - HEADER_INSET_X * 2;
    const background = new Graphics()
      .rect(0, 0, barWidth, HEADER_HEIGHT)
      .fill(0x45285c)
      .rect(0, 0, barWidth, 1)
      .fill(0xb875d0)
      .rect(0, HEADER_HEIGHT - 2, barWidth, 1)
      .fill(0x281635)
      .rect(1, HEADER_HEIGHT - 3, barWidth - 2, 1)
      .fill(0x79468f);

    // Placeholder app mark: a bright pixel equalizer tile, kept separate from the title.
    const icon = new Graphics()
      .roundRect(4, 3, HEADER_ICON_SIZE, HEADER_ICON_SIZE, 3)
      .fill(0x321b47)
      .roundRect(4, 3, HEADER_ICON_SIZE, HEADER_ICON_SIZE, 3)
      .stroke({ color: 0xe08be9, width: 1 })
      .rect(8, 10, 2, 4)
      .fill(0xffcf72)
      .rect(11, 7, 2, 7)
      .fill(0xff91c8)
      .rect(14, 9, 2, 5)
      .fill(0xffcf72);

    const heading = new Text({
      text: title,
      style: {
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 'bold',
        fill: 0xffeaff,
        letterSpacing: 0.3,
      },
    });
    heading.position.set(25, 5);

    this.addChild(background, icon, heading);
    this.position.set(HEADER_INSET_X, HEADER_INSET_Y);
  }
}
