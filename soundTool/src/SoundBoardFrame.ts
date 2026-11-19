import { Container, Graphics } from 'pixi.js';
import { SoundBoardHeader } from './SoundBoardHeader';

const FRAME_INSET = 10;
const CONTENT_TOP = 34;
const CONTENT_BOTTOM = 10;

/** A reusable pixel-style raised cabinet shell for the sound board. */
export class SoundBoardFrame extends Container {
  readonly content: Container;
  readonly contentWidth: number;
  readonly contentHeight: number;

  constructor(width = 320, height = 240) {
    super();

    this.contentWidth = width - FRAME_INSET * 2;
    this.contentHeight = height - CONTENT_TOP - CONTENT_BOTTOM;
    this.content = new Container();
    this.content.position.set(FRAME_INSET, CONTENT_TOP);

    // Offset layers fall down and right, so the face reads as sitting above the page.
    const castShadow = new Graphics()
      .roundRect(4, 5, width - 5, height - 5, 10)
      .fill(0x140b20);

    const cabinetSide = new Graphics()
      .roundRect(2, 3, width - 5, height - 5, 10)
      .fill(0x2b1739)
      .roundRect(2, 3, width - 5, height - 5, 10)
      .stroke({ color: 0x1b1027, width: 1 });

    const top = new Graphics()
      .roundRect(0, 0, width - 5, height - 5, 10)
      .fill(0x713f87)
      .roundRect(1, 1, width - 7, height - 7, 9)
      .stroke({ color: 0xc276d7, width: 1 })
      .roundRect(3, 3, width - 11, height - 11, 7)
      .fill(0x59316f)
      .roundRect(4, 4, width - 13, height - 13, 6)
      .stroke({ color: 0x9b60b7, width: 1 });

    // Bright top/left bevel and dark bottom/right bevel make the frame pop outward.
    const bevel = new Graphics()
      .moveTo(13, 6)
      .lineTo(width - 18, 6)
      .stroke({ color: 0xe3a1ef, width: 1 })
      .moveTo(6, 13)
      .lineTo(6, height - 18)
      .stroke({ color: 0xe3a1ef, width: 1 })
      .moveTo(width - 7, 15)
      .lineTo(width - 7, height - 17)
      .stroke({ color: 0x2a1738, width: 1 })
      .moveTo(15, height - 7)
      .lineTo(width - 17, height - 7)
      .stroke({ color: 0x2a1738, width: 1 })
      .moveTo(14, 8)
      .lineTo(width - 19, 8)
      .stroke({ color: 0xa867c3, width: 1, alpha: 0.8 })
      .moveTo(8, 14)
      .lineTo(8, height - 19)
      .stroke({ color: 0xa867c3, width: 1, alpha: 0.8 });

    // Small top-lit corner pixels echo the cabinet's pixel-art trim.
    const cornerPixels = new Graphics()
      .rect(5, 5, 2, 2)
      .fill(0xffc2f4)
      .rect(width - 10, 5, 2, 2)
      .fill(0xffa7e8)
      .rect(5, height - 10, 2, 2)
      .fill(0xcb82e5)
      .rect(width - 10, height - 10, 2, 2)
      .fill(0x291537);

    const header = new SoundBoardHeader(width - 16);

    this.addChild(castShadow, cabinetSide, top, bevel, cornerPixels, header, this.content);
  }
}
