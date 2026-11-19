import { Container, Graphics, Text } from 'pixi.js';
import { PixelButton, type ButtonTone } from './ui/PixelButton';

const TAB_WIDTH = 96;
const TAB_HEIGHT = 32;
const TAB_ITEMS = [
  { label: 'SFX', icon: '♫', tone: 'gold' },
  { label: 'MUSIC', icon: '♪', tone: 'violet' },
  { label: 'LIBRARY', icon: '▤', tone: 'violet' },
  { label: 'SETTINGS', icon: '⚙', tone: 'violet' },
] as const;

/** Four 112×32 navigation slots, each with a separate icon button. */
export class SoundBoardTabs extends Container {
  constructor() {
    super();
    this.addChild(new Graphics().rect(0, 0, TAB_WIDTH * TAB_ITEMS.length, TAB_HEIGHT).fill(0x39214c));
    TAB_ITEMS.forEach((item, index) => {
      const tab = new SoundBoardTab(item.label, item.icon, item.tone, index === 0);
      tab.position.x = index * TAB_WIDTH;
      this.addChild(tab);
    });
  }
}

class SoundBoardTab extends Container {
  constructor(label: string, icon: string, tone: ButtonTone, selected: boolean) {
    super();
    const button = new PixelButton(icon, tone, selected);
    button.position.set(4, 0);
    const text = new Text({
      text: label,
      style: { fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: selected ? 0xffcf72 : 0xd8b8e2 },
    });
    text.position.set(36, 12);
    this.addChild(button, text);
    if (selected) this.addChild(createSelectionLine());
  }
}

function createSelectionLine(): Graphics {
  return new Graphics().rect(36, 28, 56, 4).fill(0xffcf72);
}
