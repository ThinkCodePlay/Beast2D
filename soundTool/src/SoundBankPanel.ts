import { Container, Text } from 'pixi.js';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';
import { BANK_ROW_HEIGHT, SoundBankRow } from './SoundBankRow';

const BANK_ITEMS = [
  'jump',
  'coin',
  'hit',
  'laser',
  'boom_big',
  'power_up',
  'enemy_die',
  'select',
  'empty',
  'empty',
] as const;

/** Right-side bank list. Slots are simple child components ready for later behavior. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTitle());
    this.addChild(createSubtitle());
    this.addChild(createRows(height));
  }
}

function createTitle(): Text {
  const title = new Text({
    text: 'SOUND BANK',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xffeaff },
  });
  title.position.set(16, 4);
  return title;
}

function createSubtitle(): Text {
  const subtitle = new Text({
    text: 'RUN > GAME',
    style: { fontFamily: 'monospace', fontSize: 8, fontWeight: 'bold', fill: 0xb88acb },
  });
  subtitle.position.set(16, 20);
  return subtitle;
}

function createRows(height: number): Container {
  const rows = new Container();
  rows.position.y = 32;
  BANK_ITEMS.slice(0, Math.floor((height - rows.position.y) / BANK_ROW_HEIGHT)).forEach((name, index) => {
    const row = new SoundBankRow(index, name, name === 'laser');
    row.position.y = index * BANK_ROW_HEIGHT;
    rows.addChild(row);
  });
  return rows;
}
