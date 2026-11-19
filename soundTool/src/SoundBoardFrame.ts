import { Container } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundBoardFooter } from './SoundBoardFooter';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBoardTabs } from './SoundBoardTabs';
import { SoundControlStrip } from './SoundControlStrip';
import { SoundCreationPanel } from './SoundCreationPanel';

const DISPLAY_WIDTH = 512;
const DISPLAY_HEIGHT = 1024 / 3;
const OUTER_INSET = 16;
const HEADER_TOP = 4;
const TABS_TOP = 32;
const CONTENT_TOP = 64;
const CONTENT_HEIGHT = 208;
const CONTROLS_TOP = 272;
const FOOTER_TOP = 312;
const PANEL_GAP = 8;
const CREATION_WIDTH = 320;
const BANK_WIDTH = 152;

/** 3:2 sound-board design rendered on the requested 1536×1024 canvas. */
export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly tabs: SoundBoardTabs;
  readonly content: Container;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;
  readonly controls: SoundControlStrip;
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

    this.controls = new SoundControlStrip(DISPLAY_WIDTH - OUTER_INSET * 2, 40);
    this.controls.position.set(OUTER_INSET, CONTROLS_TOP);
    this.footer = new SoundBoardFooter(DISPLAY_WIDTH - OUTER_INSET * 2);
    this.footer.position.set(OUTER_INSET, FOOTER_TOP);

    this.addChild(board, this.header, this.tabs, this.content, this.controls, this.footer);
  }
}
