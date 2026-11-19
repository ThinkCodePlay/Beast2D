import { Container, Graphics, Text } from 'pixi.js';

type TabIcon = 'note' | 'gamepad' | 'folder' | 'gear';
type TabTone = 'selected' | 'violet';

const TAB_WIDTH = 80;
const TAB_HEIGHT = 32;
const TAB_ITEMS: { label: string; icon: TabIcon; tone: TabTone }[] = [
  { label: 'SFX', icon: 'note', tone: 'selected' },
  { label: 'MUSIC', icon: 'gamepad', tone: 'violet' },
  { label: 'LIBRARY', icon: 'folder', tone: 'violet' },
  { label: 'SETTINGS', icon: 'gear', tone: 'violet' },
];

/** Navigation tabs with icons and labels on one shared raised button face. */
export class SoundBoardTabs extends Container {
  constructor() {
    super();
    TAB_ITEMS.forEach((item, index) => {
      const tab = new SoundBoardTab(item.label, item.icon, item.tone);
      tab.position.x = index * TAB_WIDTH;
      this.addChild(tab);
    });
  }
}

class SoundBoardTab extends Container {
  constructor(label: string, icon: TabIcon, tone: TabTone) {
    super();
    const selected = tone === 'selected';
    this.addChild(drawTabFace(tone));
    this.addChild(drawTabIcon(icon, selected));
    this.addChild(createTabLabel(label, selected));
  }
}

function drawTabFace(tone: TabTone): Graphics {
  const selected = tone === 'selected';
  const fill = selected ? 0xe4aa54 : 0x59316f;
  const edge = selected ? 0xffcf72 : 0x9b60b7;
  return new Graphics()
    .rect(4, 4, TAB_WIDTH, TAB_HEIGHT).fill(0x140b20)
    .rect(0, 0, TAB_WIDTH, TAB_HEIGHT).fill(fill)
    .rect(4, 2, TAB_WIDTH - 8, 2).fill(0xe3a1ef)
    .rect(2, 4, 2, TAB_HEIGHT - 8).fill(0xe3a1ef)
    .rect(TAB_WIDTH - 2, 4, 2, TAB_HEIGHT - 8).fill(edge)
    .rect(4, TAB_HEIGHT - 2, TAB_WIDTH - 8, 2).fill(edge)
    .rect(36, 28, 40, 4).fill(selected ? 0xffcf72 : fill);
}

function drawTabIcon(icon: TabIcon, selected: boolean): Graphics | Text {
  const color = selected ? 0x392044 : 0xd8b8e2;
  if (icon === 'note') {
    const note = new Text({
      text: '♫',
      style: { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', fill: color },
    });
    note.anchor.set(0.5);
    note.position.set(16, 16);
    return note;
  }
  if (icon === 'gamepad') {
    return drawGamepad(color);
  }
  if (icon === 'folder') {
    return new Graphics()
      .rect(5, 10, 10, 4).fill(color)
      .rect(5, 14, 22, 12).fill(color)
      .rect(9, 7, 9, 5).fill(color)
      .rect(5, 24, 22, 2).fill(0x392044);
  }
  const gear = new Text({
    text: '⚙',
    style: { fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', fill: color },
  });
  gear.anchor.set(0.5);
  gear.position.set(16, 16);
  return gear;
}

function drawGamepad(color: number): Graphics {
  return new Graphics()
    .rect(8, 9, 16, 3).fill(0x392044)
    .rect(4, 12, 24, 9).fill(0x392044)
    .rect(8, 21, 16, 3).fill(0x392044)
    .rect(8, 11, 16, 3).fill(color)
    .rect(6, 13, 20, 7).fill(color)
    .rect(8, 20, 16, 2).fill(color)
    .rect(9, 14, 3, 3).fill(0x392044)
    .rect(8, 15, 5, 1).fill(0x392044)
    .rect(20, 14, 2, 2).fill(0x392044)
    .rect(23, 16, 2, 2).fill(0x392044)
    .rect(7, 9, 4, 2).fill(color)
    .rect(21, 9, 4, 2).fill(color);
}

function createTabLabel(label: string, selected: boolean): Text {
  const text = new Text({
    text: label,
    style: { fontFamily: 'monospace', fontSize: 7, fontWeight: 'bold', fill: selected ? 0x392044 : 0xd8b8e2 },
  });
  text.position.set(32, 12);
  return text;
}
