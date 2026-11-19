import { Container, Graphics } from 'pixi.js';

export type PresetIcon =
  | 'coin' | 'star' | 'heart' | 'gem' | 'potion' | 'chest'
  | 'boot' | 'bomb' | 'burst' | 'sparkle' | 'bell' | 'skull';

const TILE = 4;
const PAD_SIZE = 40;
const ICON_INSET = 4;
const ICON_ART: Record<PresetIcon, string[]> = {
  coin: ['..ddd..', '.dgggd.', 'dgggggd', 'dggyygd', 'dggyygd', 'dgggggd', '.dgggd.'],
  star: ['...d...', '..dyd..', '.dyyd..', 'dyyyyyd', '..dyd..', '.d...d.', 'd.....d'],
  heart: ['.dd.dd.', 'dppdppd', 'dpppppd', '.dpppd.', '..dpd..', '...d...', '.......'],
  gem: ['..ddd..', '.dbbbd.', 'dbbcbcd', 'dbbccbd', '.dbbbd.', '..ddd..', '.......'],
  potion: ['...ddd.', '...dyd.', '...ddd.', '..drrd.', '.drrrd.', '.drrrd.', '..ddd..'],
  chest: ['ddddddd', 'dgggggd', 'dgyyygd', 'dggygyd', 'dgyyygd', 'dgggggd', 'ddddddd'],
  boot: ['...dd..', '...dgd.', '..ddgd.', '.dgggd.', '.dggggd', 'dgggggd', 'ddddddd'],
  bomb: ['....dd.', '...dyd.', '..ddggd', '.dggggd', '.dggggd', '..dggd.', '...ddd.'],
  burst: ['...d...', '..dyd..', '.dyyyd.', 'dyyyyyd', '.dyyyd.', '..dyd..', '...d...'],
  sparkle: ['...d...', '..dyd..', '.d.y.d.', 'dyyyyyd', '.d.y.d.', '..dyd..', '...d...'],
  bell: ['...ddd.', '..dyyyd', '.dggggd', '.dggggd', '.dggggd', '..ddgd.', '...ddd.'],
  skull: ['..ddd..', '.dwwwd.', 'dwwwwwd', 'dwwwwwd', 'dwdwdwd', '.dwdwd.', '..ddd..'],
};

const COLORS: Record<string, number> = {
  d: 0x4b2a50, g: 0xf29a43, y: 0xfff0aa, p: 0xff91c8,
  b: 0x548be2, c: 0xa7d4ff, w: 0xfff4dc, r: 0xc85167,
};

/** 32×32 gold preset pad with a recognizable pixel-art symbol. */
export class PresetPad extends Container {
  constructor(icon: PresetIcon, selected = false) {
    super();
    this.addChild(drawPadFace(selected), drawIcon(icon));
  }
}

function drawPadFace(selected: boolean): Graphics {
  const frameColor = selected ? 0xf06b9d : 0x4b2a50;
  const faceColor = selected ? 0xf1bd5e : 0xe4aa54;
  return new Graphics()
    .rect(4, 4, PAD_SIZE - 4, PAD_SIZE - 4).fill(0x140b20)
    .rect(0, 0, PAD_SIZE - 4, PAD_SIZE - 4).fill(frameColor)
    .rect(2, 2, PAD_SIZE - 8, PAD_SIZE - 8).fill(faceColor)
    .rect(4, 3, PAD_SIZE - 12, 2).fill(0xffe6c2)
    .rect(3, 4, 2, PAD_SIZE - 16).fill(0xffe6c2)
    .rect(PAD_SIZE - 10, 4, 2, PAD_SIZE - 16).fill(selected ? 0xb94378 : 0xa66c3f)
    .rect(4, PAD_SIZE - 10, PAD_SIZE - 12, 2).fill(0x9a5b3c)
    .rect(PAD_SIZE - 12, PAD_SIZE - 12, 4, 4).fill(selected ? 0xfff2bd : 0x36203f);
}

function drawIcon(icon: PresetIcon): Graphics {
  const graphic = new Graphics();
  ICON_ART[icon].forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel !== '.') graphic.rect(ICON_INSET + x * TILE, ICON_INSET + y * TILE, TILE, TILE).fill(COLORS[pixel]);
  }));
  return graphic;
}
