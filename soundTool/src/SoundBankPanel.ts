import { Container, Text } from 'pixi.js';
import { RaisedPanelFrame } from './ui/RaisedPanelFrame';

/** Empty right-side section, ready for the sound-bank list. */
export class SoundBankPanel extends Container {
  constructor(width: number, height: number) {
    super();
    this.addChild(new RaisedPanelFrame(width, height));
    this.addChild(createTitle());
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
