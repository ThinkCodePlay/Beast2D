import { Container } from 'pixi.js';
import { BoardFrame } from './BoardFrame';
import { SoundBoardHeader } from './SoundBoardHeader';

const FRAME_INSET = 10;
const CONTENT_TOP = 34;
const CONTENT_BOTTOM = 10;
const HEADER_WIDTH_INSET = 16;

/** Composes the raised cabinet, title bar and future board contents. */
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

    const boardFrame = new BoardFrame(width, height);
    const header = new SoundBoardHeader(width - HEADER_WIDTH_INSET);

    this.addChild(boardFrame, header, this.content);
  }
}
