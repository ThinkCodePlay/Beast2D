import { Container, Graphics, Text } from 'pixi.js';

type TabIcon = 'note' | 'gamepad' | 'folder' | 'gear';
type TabTone = 'selected' | 'violet';

const TAB_WIDTH = 72;
const TAB_HEIGHT = 28;
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
    .rect(4, TAB_HEIGHT - 2, TAB_WIDTH - 8, 2).fill(edge);
}

function drawTabIcon(icon: TabIcon, selected: boolean): Graphics | Text {
  const color = selected ? 0x392044 : 0xd8b8e2;
  if (icon === 'note') {
    const glyph = new Text({
      text: '♫',
      style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: color }, resolution: 3,
    });
    glyph.anchor.set(0.5);
    glyph.position.set(14, 16);
    return glyph;
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
    style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: color }, resolution: 3,
  });
  gear.anchor.set(0.5);
  gear.position.set(16, 16);
  return gear;
}

function drawGamepad(color: number): Graphics {
  return new Graphics()
    .rect(6, 14, 10, 4).fill(color)
    .rect(6, 18, 18, 9).fill(color)
    .rect(8, 27, 14, 2).fill(0x392044)
    .rect(10, 19, 3, 3).fill(0x392044)
    .rect(9, 20, 5, 1).fill(0x392044)
    .rect(19, 19, 2, 2).fill(0x392044)
    .rect(22, 21, 2, 2).fill(0x392044)
    .rect(7, 12, 4, 2).fill(color)
    .rect(20, 12, 4, 2).fill(color);
}

function createTabLabel(label: string, selected: boolean): Text {
  const text = new Text({
    text: label,
    style: { fontFamily: 'monogram', fontSize: 11, fontWeight: 'bold', fill: selected ? 0x392044 : 0xd8b8e2 }, resolution: 3,
  });
  text.position.set(28, 10);
  return text;
}
