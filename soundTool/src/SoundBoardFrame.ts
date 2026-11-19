import { Container } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundCreationPanel } from './SoundCreationPanel';

const FRAME_INSET = 8;
const CONTENT_TOP = 32;
const CONTENT_BOTTOM = 8;
const HEADER_WIDTH_INSET = 16;
const PANEL_GAP = 16;
const BANK_PANEL_WIDTH = 96;

/**
 * Self-contained sound board frame composition.
 * Owns the cabinet artwork, header, and content area for the two board sections.
 */
export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly content: Container;
  readonly contentWidth: number;
  readonly contentHeight: number;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;

  constructor(width = 320, height = 240) {
    super();

    this.contentWidth = width - FRAME_INSET * 2;
    this.contentHeight = height - CONTENT_TOP - CONTENT_BOTTOM;

    const frame = new BoardFrameArtwork(width, height);
    this.header = new SoundBoardHeader(width - HEADER_WIDTH_INSET);
    this.content = new Container();
    this.content.position.set(FRAME_INSET, CONTENT_TOP);

    const panelWidth = this.contentWidth - PANEL_GAP;
    const creationWidth = panelWidth - BANK_PANEL_WIDTH;
    const bankWidth = BANK_PANEL_WIDTH;
    this.creationPanel = new SoundCreationPanel(creationWidth, this.contentHeight);
    this.bankPanel = new SoundBankPanel(bankWidth, this.contentHeight);
    this.bankPanel.position.set(creationWidth + PANEL_GAP, 0);
    this.content.addChild(this.creationPanel, this.bankPanel);

    // Each section owns its own contents; the shell only sets their shared layout.
    this.addChild(frame, this.header, this.content);
  }
}
