import { Container, Graphics } from 'pixi.js';

/** A reusable pixel-style rounded outer shell for the sound board. */
export class SoundBoardFrame extends Container {
  readonly content: Container;
  readonly contentWidth: number;
  readonly contentHeight: number;

  constructor(width = 320, height = 240) {
    super();

    this.contentWidth = width - 20;
    this.contentHeight = height - 20;
    this.content = new Container();
    this.content.position.set(10, 10);

    const shadow = new Graphics()
      .roundRect(2, 3, width - 4, height - 4, 9)
      .fill(0x160e22);

    const shell = new Graphics()
      .roundRect(0, 0, width, height, 9)
      .fill(0x24152f)
      .roundRect(1, 1, width - 2, height - 2, 8)
      .stroke({ color: 0x9c5bbb, width: 1 })
      .roundRect(3, 3, width - 6, height - 6, 6)
      .fill(0x58336f)
      .roundRect(4, 4, width - 8, height - 8, 5)
      .stroke({ color: 0xd18ae5, width: 1 })
      .roundRect(6, 6, width - 12, height - 12, 3)
      .fill(0x342044)
      .roundRect(8, 8, width - 16, height - 16, 2)
      .fill(0x422653);

    // One-pixel bevel lines give the frame the raised, layered cabinet edge in the mockup.
    const bevel = new Graphics()
      .moveTo(11, 8)
      .lineTo(width - 12, 8)
      .stroke({ color: 0x9c62b4, width: 1, alpha: 0.9 })
      .moveTo(8, 11)
      .lineTo(8, height - 12)
      .stroke({ color: 0x9c62b4, width: 1, alpha: 0.9 })
      .moveTo(width - 9, 12)
      .lineTo(width - 9, height - 12)
      .stroke({ color: 0x21152d, width: 1, alpha: 0.9 })
      .moveTo(11, height - 9)
      .lineTo(width - 12, height - 9)
      .stroke({ color: 0x21152d, width: 1, alpha: 0.9 });

    // Small inset corner pixels echo the bright/dark corner marks on the cabinet.
    const cornerPixels = new Graphics()
      .rect(4, 4, 2, 2)
      .fill(0xf3a4ef)
      .rect(width - 6, height - 6, 2, 2)
      .fill(0xff78b8);

    this.addChild(shadow, shell, bevel, cornerPixels, this.content);
  }
}
