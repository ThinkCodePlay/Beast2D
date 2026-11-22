import { Container, type Texture } from 'pixi.js';
import { BoardFrame as BoardFrameArtwork } from './BoardFrame';
import type { ControlMode } from '../controls';
import type { SoundBank } from '../bank';
import type { TransportActions } from '../transport';
import type { PresetTextures } from './PresetPad';
import type { SoundSequence } from '../audio/model';
import { SoundBankPanel } from './SoundBankPanel';
import { SoundBoardFooter } from './SoundBoardFooter';
import { SoundBoardHeader } from './SoundBoardHeader';
import { SoundBoardTabs, type TabIconTextures } from './SoundBoardTabs';
import { SoundControlStrip } from './SoundControlStrip';
import { SoundCreationPanel } from './SoundCreationPanel';

/**
 * 3:2 sound-board design rendered on the requested 1536×1024 canvas: header,
 * tabs, creation panel, sound bank, control strip and footer. In '3d' control
 * mode the buttons and dials are left out for the 3D scene to place as
 * meshes, and the frame stays at design scale for texture capture.
 */

export const BOARD_WIDTH = 512;
export const BOARD_HEIGHT = 1024 / 3;
export const CONTENT_INSET = 7;
const TABS_INSET = 8;
export const CONTROLS_INSET = 7;
const FOOTER_INSET = 4;
export const HEADER_INSET = 4;
export const HEADER_TOP = 4;
const TABS_TOP = 28;
export const CONTENT_TOP = 56;
export const CONTENT_HEIGHT = 204;
export const CONTROLS_TOP = 260; // 4px below the creation panel, so the dial row breathes under the waveform buttons.
const CONTROLS_HEIGHT = 157 / 3;
const FOOTER_TOP = 315;
export const BANK_LEFT = 346; // Absolute design x so the bank stays put next to the 330-wide creation panel.
export const CREATION_WIDTH = 330;
const BANK_WIDTH = 159;
// FOOTER_TOP stays the lower bound for the bank and the control strip.

export interface SoundBoardFrameOptions {
  /** Transport and live-dial callbacks; required in '2d' mode, unused in '3d'. */
  transport?: TransportActions;
  /** Sound bank driving the name LCD and the selectable bank rows; required in '2d' mode. */
  bank?: SoundBank;
  /** '2d' draws and wires the controls, '3d' leaves them out for the 3D scene. Default '2d'. */
  controls?: ControlMode;
}

export class SoundBoardFrame extends Container {
  readonly header: SoundBoardHeader;
  readonly tabs: SoundBoardTabs;
  readonly content: Container;
  readonly creationPanel: SoundCreationPanel;
  readonly bankPanel: SoundBankPanel;
  readonly controls: SoundControlStrip;
  readonly footer: SoundBoardFooter;

  constructor(presetTextures: PresetTextures, mascotTexture: Texture, tabIconTextures: TabIconTextures, sequence: SoundSequence, options: SoundBoardFrameOptions = {}) {
    super();
    const controls = options.controls ?? '2d';
    if (controls === '2d') this.scale.set(3);
    const board = new BoardFrameArtwork(BOARD_WIDTH, BOARD_HEIGHT);
    this.header = new SoundBoardHeader(BOARD_WIDTH - HEADER_INSET * 2, mascotTexture, controls);
    this.header.position.set(HEADER_INSET, HEADER_TOP);

    this.tabs = new SoundBoardTabs(tabIconTextures);
    this.tabs.position.set(TABS_INSET, TABS_TOP);

    this.content = new Container();
    this.content.position.set(CONTENT_INSET, CONTENT_TOP);
    this.creationPanel = new SoundCreationPanel(CREATION_WIDTH, CONTENT_HEIGHT, presetTextures, sequence, { transport: options.transport, bank: options.bank, controls });
    // The bank runs full height beside the creation panel and the control strip.
    const bankHeight = CONTROLS_TOP + CONTROLS_HEIGHT - CONTENT_TOP;
    this.bankPanel = new SoundBankPanel(BANK_WIDTH, bankHeight, options.bank, controls);
    this.bankPanel.position.x = BANK_LEFT - CONTENT_INSET;
    this.content.addChild(this.creationPanel, this.bankPanel);

    this.controls = new SoundControlStrip(CREATION_WIDTH, CONTROLS_HEIGHT, sequence, { dials: options.transport, controls });
    this.controls.position.set(CONTROLS_INSET, CONTROLS_TOP);
    this.footer = new SoundBoardFooter(BOARD_WIDTH - FOOTER_INSET * 2);
    this.footer.position.set(FOOTER_INSET, FOOTER_TOP);

    this.addChild(board, this.header, this.content, this.tabs, this.controls, this.footer);
  }
}
