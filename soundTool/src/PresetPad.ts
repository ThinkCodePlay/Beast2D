import { Container, Graphics } from 'pixi.js';

export type PresetIcon =
  | 'coin' | 'star' | 'heart' | 'gem' | 'potion' | 'chest'
  | 'boot' | 'bomb' | 'burst' | 'sparkle' | 'bell' | 'skull';

const TILE = 4;
const ICON_ART: Record<PresetIcon, string[]> = {
  coin: ['..ddd..', '.dgggd.', 'dgggggd', 'dggyygd', 'dgggggd', '.dgggd.', '..ddd..'],
  star: ['...d...', '..dyd..', '.dyyyd.', 'dyyyyyd', '.dyyyd.', 'd.d.d.d', 'd.....d'],
  heart: ['.pp.pp.', 'ppppppp', 'ppppppp', '.ppppp.', '..ppp..', '...p...', '.......'],
  gem: ['..ddd..', '.dbbbd.', 'dbbcbcd', 'dbbcbcd', '.dbbbd.', '..ddd..', '.......'],
  potion: ['...ddd.', '...dyd.', '...ddd.', '..drrd.', '.drrrd.', '.dgggd.', '..ddd..'],
  chest: ['ddddddd', 'dgggggd', 'dgyyygd', 'dggygyd', 'dgyyygd', 'dgggggd', 'ddddddd'],
  boot: ['...dd..', '...dgd.', '..ddgd.', '.dgggd.', '.dggggd', 'dgggggd', 'ddddddd'],
  bomb: ['....d..', '...dyd.', '..dggd.', '.dgggd.', '.dgggd.', '..dggd.', '...ddd.'],
  burst: ['...y...', '..ypy..', '.yyyyy.', 'yypypyy', '.yyyyy.', '..ypy..', '...y...'],
  sparkle: ['...p...', '..ppp..', '.p.y.p.', 'ppyyypp', '.p.y.p.', '..ppp..', '...p...'],
  bell: ['...yyy.', '..yggg.', '.yggggg', '.yggggg', '.yggggg', '..yygy.', '...yyy.'],
  skull: ['..ddd..', '.dwwwd.', 'dwwwwwd', 'dwwwwwd', 'dwdwdwd', '.dwdwd.', '..ddd..'],
};

const COLORS: Record<string, number> = {
  d: 0x4b2a50, g: 0xf29a43, y: 0xfff0aa, p: 0xff91c8,
  b: 0x548be2, c: 0xa7d4ff, w: 0xfff4dc, r: 0xc85167,
};

/** 32×32 gold preset pad with a pixel icon and strong selected bevel. */
export class PresetPad extends Container {
  constructor(icon: PresetIcon, selected = false) {
    super();
    this.addChild(drawPadFace(selected));
    if (selected) this.addChild(drawSelectedIcon(ICON_ART[icon]));
    this.addChild(drawIcon(icon));
  }
}

function drawPadFace(selected: boolean): Graphics {
  const border = selected ? 0xf06b9d : 0x4b2a50;
  const face = selected ? 0xf1bd5e : 0xe4aa54;
  return new Graphics()
    .rect(4, 4, 28, 28).fill(0x140b20)
    .rect(0, 0, 28, 28).fill(border)
    .rect(2, 2, 24, 24).fill(face)
    .rect(4, 3, 20, 2).fill(0xffe6c2)
    .rect(3, 4, 2, 18).fill(0xffe6c2)
    .rect(25, 4, 2, 20).fill(selected ? 0xb94378 : 0xa66c3f)
    .rect(4, 24, 20, 2).fill(0x9a5b3c)
    .rect(22, 22, 4, 4).fill(selected ? 0xfff2bd : 0x36203f);
}

function drawSelectedIcon(rows: string[]): Graphics {
  const outline = new Graphics();
  rows.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel !== '.') outline.rect(2 + x * TILE, 2 + y * TILE, TILE, TILE).fill(0x4b2a50);
  }));
  return outline;
}

function drawIcon(icon: PresetIcon): Graphics {
  const graphic = new Graphics();
  ICON_ART[icon].forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel !== '.') graphic.rect(2 + x * TILE, 2 + y * TILE, TILE, TILE).fill(COLORS[pixel]);
  }));
  return graphic;
}
