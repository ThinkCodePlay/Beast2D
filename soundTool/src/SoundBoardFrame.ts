import { Container, type Texture } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import type { PresetTextures } from './PresetPad';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundBoardFooter } from './SoundBoardFooter';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBoardTabs, type TabIconTextures } from './SoundBoardTabs';
import { SoundControlStrip } from './SoundControlStrip';
import { SoundCreationPanel } from './SoundCreationPanel';

const DISPLAY_WIDTH = 512;
const DISPLAY_HEIGHT = 1024 / 3;
const CONTENT_INSET = 7;
const TABS_INSET = 8;
const CONTROLS_INSET = 7;
const FOOTER_INSET = 4;
const HEADER_INSET = 4;
const HEADER_TOP = 4;
const TABS_TOP = 28;
const CONTENT_TOP = 56;
const CONTENT_HEIGHT = 204;
const CONTROLS_TOP = 256;
const CONTROLS_HEIGHT = 157 / 3;
const FOOTER_TOP = 315;
const BANK_LEFT = 346; // Absolute design x so the bank stays put next to the 330-wide creation panel.
const CREATION_WIDTH = 330;
const BANK_WIDTH = 159;
// FOOTER_TOP stays the lower bound for the bank and the control strip.

/** 3:2 sound-board design rendered on the requested 1536×1024 canvas. */
export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly tabs: SoundBoardTabs;
  readonly content: Container;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;
  readonly controls: SoundControlStrip;
  readonly footer: SoundBoardFooter;

  constructor(presetTextures: PresetTextures, mascotTexture: Texture, tabIconTextures: TabIconTextures = {}) {
    super();
    this.scale.set(3);
    const board = new BoardFrameArtwork(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    this.header = new SoundBoardHeader(DISPLAY_WIDTH - HEADER_INSET * 2, mascotTexture);
    this.header.position.set(HEADER_INSET, HEADER_TOP);

    this.tabs = new SoundBoardTabs(tabIconTextures);
    this.tabs.position.set(TABS_INSET, TABS_TOP);

    this.content = new Container();
    this.content.position.set(CONTENT_INSET, CONTENT_TOP);
    this.creationPanel = new SoundCreationPanel(CREATION_WIDTH, CONTENT_HEIGHT, presetTextures);
    // The bank runs full height beside the creation panel and the control strip.
    const bankHeight = CONTROLS_TOP + CONTROLS_HEIGHT - CONTENT_TOP;
    this.bankPanel = new SoundBankPanel(BANK_WIDTH, bankHeight);
    this.bankPanel.position.x = BANK_LEFT - CONTENT_INSET;
    this.content.addChild(this.creationPanel, this.bankPanel);

    this.controls = new SoundControlStrip(CREATION_WIDTH, CONTROLS_HEIGHT);
    this.controls.position.set(CONTROLS_INSET, CONTROLS_TOP);
    this.footer = new SoundBoardFooter(DISPLAY_WIDTH - FOOTER_INSET * 2);
    this.footer.position.set(FOOTER_INSET, FOOTER_TOP);

    this.addChild(board, this.header, this.content, this.tabs, this.controls, this.footer);
  }
}
