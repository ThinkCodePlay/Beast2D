import { Container, Graphics, Sprite, Text, type Texture } from 'pixi.js';
import { drawGradientFace } from './ui/GradientFace';
import { makePressable } from './ui/Pressable';

type TabIcon = 'note' | 'gamepad' | 'folder' | 'gear';
export type TabIconTextures = Partial<Record<TabIcon, Texture>>;
const SPRITE_ICON_W = 86 / 3; // Icons were captured in a uniform 86x58-native-px window.
const SPRITE_ICON_H = 58 / 3;
type TabTone = 'selected' | 'violet';

const TAB_HEIGHT = 32;
const TAB_ITEMS: { label: string; icon: TabIcon; tone: TabTone; x: number; width: number }[] = [
  { label: 'SFX', icon: 'note', tone: 'selected', x: 0, width: 76 },
  { label: 'MUSIC', icon: 'gamepad', tone: 'violet', x: 76, width: 71 },
  { label: 'LIBRARY', icon: 'folder', tone: 'violet', x: 147, width: 78 },
  { label: 'SETTINGS', icon: 'gear', tone: 'violet', x: 224, width: 80 },
];

/** Navigation tabs with icons and labels on one shared stepped face. */
export class SoundBoardTabs extends Container {
  constructor(iconTextures: TabIconTextures = {}) {
    super();
    TAB_ITEMS.forEach((item) => {
      const tab = new SoundBoardTab(item.label, item.icon, item.tone, item.width, iconTextures[item.icon]);
      tab.position.x = item.x;
      if (item.tone === 'selected') tab.position.y = -3.5; // Reference raises the active tab.
      this.addChild(tab);
    });
  }
}

class SoundBoardTab extends Container {
  constructor(label: string, icon: TabIcon, tone: TabTone, width: number, iconTexture?: Texture) {
    super();
    const face = tone === 'selected' ? 0xfcc457 : 0x936bbe;
    const textWidth = label.length * 7.5;
    const iconLeft = Math.round((width - (22 + 6 + textWidth)) / 2);
    this.addChild(drawTabFace(tone, width));
    this.addChild(drawTabIcon(icon, face, iconLeft, iconTexture));
    this.addChild(createTabLabel(label, iconLeft + 28));
    makePressable(this);
  }
}

function drawTabFace(tone: TabTone, width: number): Graphics {
  const selected = tone === 'selected';
  const tab = new Graphics();
  drawGradientFace(tab, 0, 0, width - 2, TAB_HEIGHT - 2 + (selected ? 5 : 0), 2, selected
    ? { edge: 0x24152e, top: 0xffe8b0, mid: 0xfcc457, bottom: 0xe8a03c }
    : { edge: 0x24152e, top: 0xb286d1, mid: 0x936bbe, bottom: 0x58318a }, 0.85, 4 / 3);
  return tab;
}

function drawTabIcon(icon: TabIcon, face: number, left: number, texture?: Texture): Graphics | Text | Sprite {
  const color = 0x392044;
  if (texture) {
    const sprite = new Sprite(texture);
    sprite.width = SPRITE_ICON_W;
    sprite.height = SPRITE_ICON_H;
    sprite.position.set(left + 11 - SPRITE_ICON_W / 2, 13 - SPRITE_ICON_H / 2);
    return sprite;
  }
  if (icon === 'note') return drawNote(color, left);
  if (icon === 'gamepad') return drawGamepad(color, left);
  if (icon === 'folder') return drawFolder(color, face, left);
  const gear = new Text({
    text: '⚙',
    style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: color, stroke: { color: 0x2a1440, width: 0.75 } }, resolution: 3,
  });
  gear.anchor.set(0.5);
  gear.position.set(left + 11, 16);
  return gear;
}

function drawNote(color: number, left: number): Graphics {
  return new Graphics()
    .poly([left + 7, 7, left + 20, 5, left + 20, 10, left + 9, 12]).fill(color)
    .rect(left + 7, 7, 2, 13).fill(color)
    .rect(left + 18, 5, 2, 13).fill(color)
    .ellipse(left + 5, 20, 4, 3).fill(color)
    .ellipse(left + 16, 18, 4, 3).fill(color);
}

function drawGamepad(color: number, left: number): Graphics {
  const detail = 0xd8c8e8; // Reference cutouts read light lavender, not face color.
  return new Graphics()
    .roundRect(left + 2, 10, 18, 9, 3).fill(color)
    .poly([left + 2, 15, left + 7, 15, left + 4, 25, left, 25]).fill(color)
    .poly([left + 20, 15, left + 15, 15, left + 18, 25, left + 22, 25]).fill(color)
    .rect(left + 4, 13, 5, 2).fill(detail)
    .rect(left + 5.5, 11.5, 2, 5).fill(detail)
    .circle(left + 15, 13, 1.4).fill(detail)
    .circle(left + 17.5, 15.5, 1.4).fill(detail)
    .circle(left + 12.5, 15.5, 1.4).fill(detail)
    .circle(left + 15, 18, 1.4).fill(detail);
}

function drawFolder(color: number, face: number, left: number): Graphics {
  return new Graphics()
    .roundRect(left, 9, 9, 4, 1).fill(color)
    .roundRect(left, 11, 23, 14, 2).fill(color)
    .rect(left + 2, 13, 19, 1).fill(face)
    .roundRect(left + 2, 14, 19, 9, 1).fill({ color: face, alpha: 0.25 });
}

function createTabLabel(label: string, x: number): Text {
  const text = new Text({
    text: label,
    style: { fontFamily: 'monogram', fontSize: 13, fontWeight: 'bold', fill: 0x392044 }, resolution: 3,
  });
  text.position.set(x, 7);
  return text;
}
