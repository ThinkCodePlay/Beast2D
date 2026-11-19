import { Container, type Texture } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import type { PresetTextures } from './PresetPad';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundBoardFooter } from './SoundBoardFooter';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBoardTabs } from './SoundBoardTabs';
import { SoundControlStrip } from './SoundControlStrip';
import { SoundCreationPanel } from './SoundCreationPanel';

const DISPLAY_WIDTH = 512;
const DISPLAY_HEIGHT = 1024 / 3;
const CONTENT_INSET = 12;
const TABS_INSET = 8;
const CONTROLS_INSET = 7;
const FOOTER_INSET = 4;
const HEADER_INSET = 4;
const HEADER_TOP = 4;
const TABS_TOP = 28;
const CONTENT_TOP = 56;
const CONTENT_HEIGHT = 200;
const CONTROLS_TOP = 264;
const FOOTER_TOP = 312;
const PANEL_GAP = 4;
const CREATION_WIDTH = 330;
const BANK_WIDTH = 153;

/** 3:2 sound-board design rendered on the requested 1536×1024 canvas. */
export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly tabs: SoundBoardTabs;
  readonly content: Container;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;
  readonly controls: SoundControlStrip;
  readonly footer: SoundBoardFooter;

  constructor(presetTextures: PresetTextures, mascotTexture: Texture) {
    super();
    this.scale.set(3);
    const board = new BoardFrameArtwork(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    this.header = new SoundBoardHeader(DISPLAY_WIDTH - HEADER_INSET * 2, mascotTexture);
    this.header.position.set(HEADER_INSET, HEADER_TOP);

    this.tabs = new SoundBoardTabs();
    this.tabs.position.set(TABS_INSET, TABS_TOP);

    this.content = new Container();
    this.content.position.set(CONTENT_INSET, CONTENT_TOP);
    this.creationPanel = new SoundCreationPanel(CREATION_WIDTH, CONTENT_HEIGHT, presetTextures);
    this.bankPanel = new SoundBankPanel(BANK_WIDTH, CONTENT_HEIGHT);
    this.bankPanel.position.x = CREATION_WIDTH + PANEL_GAP;
    this.content.addChild(this.creationPanel, this.bankPanel);

    this.controls = new SoundControlStrip(DISPLAY_WIDTH - CONTROLS_INSET * 2, 48);
    this.controls.position.set(CONTROLS_INSET, CONTROLS_TOP);
    this.footer = new SoundBoardFooter(DISPLAY_WIDTH - FOOTER_INSET * 2);
    this.footer.position.set(FOOTER_INSET, FOOTER_TOP);

    this.addChild(board, this.header, this.tabs, this.content, this.controls, this.footer);
  }
}
