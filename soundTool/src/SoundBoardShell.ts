import { Container } from 'pixi.js';
import { BoardFrame } from './BoardFrame';
import { SoundBoardHeader } from './SoundBoardHeader';

const FRAME_INSET = 10;
const CONTENT_TOP = 34;
const CONTENT_BOTTOM = 10;
const HEADER_WIDTH_INSET = 16;

/**
 * Self-contained sound board shell.
 * Owns the decorative frame, header, and the content slot for board controls.
 */
export class SoundBoardShell extends Container {
  readonly header: SoundBoardHeader;
  readonly content: Container;
  readonly contentWidth: number;
  readonly contentHeight: number;

  constructor(width = 320, height = 240) {
    super();

    this.contentWidth = width - FRAME_INSET * 2;
    this.contentHeight = height - CONTENT_TOP - CONTENT_BOTTOM;

    const frame = new BoardFrame(width, height);
    this.header = new SoundBoardHeader(width - HEADER_WIDTH_INSET);
    this.content = new Container();
    this.content.position.set(FRAME_INSET, CONTENT_TOP);

    // The shell owns its complete structure; callers only supply board content.
    this.addChild(frame, this.header, this.content);
  }
}
