import { Container } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundBoardFooter } from './SoundBoardFooter';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBoardTabs } from './SoundBoardTabs';
import { SoundCreationPanel } from './SoundCreationPanel';

const DISPLAY_WIDTH = 512;
const DISPLAY_HEIGHT = 1024 / 3;
const OUTER_INSET = 16;
const HEADER_TOP = 8;
const TABS_TOP = 48;
const CONTENT_TOP = 80;
const CONTENT_HEIGHT = 224;
const FOOTER_TOP = 312;
const PANEL_GAP = 16;
const CREATION_WIDTH = 288;
const BANK_WIDTH = 160;

/** 3:2 sound-board design rendered on the requested 1536×1024 canvas. */
export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly tabs: SoundBoardTabs;
  readonly content: Container;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;
  readonly footer: SoundBoardFooter;

  constructor() {
    super();
    this.scale.set(3);
    const board = new BoardFrameArtwork(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    this.header = new SoundBoardHeader(DISPLAY_WIDTH - OUTER_INSET * 2);
    this.header.position.set(OUTER_INSET, HEADER_TOP);

    this.tabs = new SoundBoardTabs();
    this.tabs.position.set(OUTER_INSET, TABS_TOP);

    this.content = new Container();
    this.content.position.set(OUTER_INSET, CONTENT_TOP);
    this.creationPanel = new SoundCreationPanel(CREATION_WIDTH, CONTENT_HEIGHT);
    this.bankPanel = new SoundBankPanel(BANK_WIDTH, CONTENT_HEIGHT);
    this.bankPanel.position.x = CREATION_WIDTH + PANEL_GAP;
    this.content.addChild(this.creationPanel, this.bankPanel);

    this.footer = new SoundBoardFooter(DISPLAY_WIDTH - OUTER_INSET * 2);
    this.footer.position.set(OUTER_INSET, FOOTER_TOP);

    this.addChild(board, this.header, this.tabs, this.content, this.footer);
  }
}
