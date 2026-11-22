import { Container, Graphics, Text } from 'pixi.js';

export const BANK_ROW_HEIGHT = 40 / 3;
const ROW_LEFT = 4;
const NAME_LEFT = 36;
const INDEX_COLUMN_WIDTH = 32;

/**
 * One numbered sound-bank slot with an individual thin outline and cell
 * rules. Redraws itself when its selection state changes.
 */
export class SoundBankRow extends Container {
  private selected: boolean;

  constructor(
    private readonly index: number,
    private readonly slotName: string,
    selected: boolean,
    private readonly rowWidth: number,
  ) {
    super();
    this.selected = selected;
    this.draw();
  }

  /** Redraw with a new selection state. */
  setSelected(selected: boolean): void {
    if (selected === this.selected) return;
    this.selected = selected;
    this.draw();
  }

  private draw(): void {
    this.removeChildren().forEach(child => child.destroy());
    this.addChild(drawRow(this.selected, this.rowWidth));
    this.addChild(createIndex(this.index, this.selected));
    this.addChild(createName(this.slotName, this.selected));
    if (this.slotName !== 'empty') this.addChild(createPreviewGlyph(this.rowWidth, this.selected));
  }
}

function drawRow(selected: boolean, width: number): Graphics {
  const face = selected ? 0xfdd154 : 0x2c163a;
  const topEdge = selected ? 0xffe18a : 0x4a2c5e;
  const bottomEdge = selected ? 0x9a5b3c : 0x1e0f2c;
  const divider = selected ? 0x9a5b3c : 0x43295a;
  const row = new Graphics()
    .rect(ROW_LEFT + 1, 1, width - 1, BANK_ROW_HEIGHT - 1).fill(0x1b1027)
    .rect(ROW_LEFT, 0, width - 1, BANK_ROW_HEIGHT - 1).fill(face)
    .rect(ROW_LEFT, 0, width - 1, 1).fill(topEdge)
    .rect(ROW_LEFT, 0, 1, BANK_ROW_HEIGHT - 1).fill(topEdge)
    .rect(ROW_LEFT, BANK_ROW_HEIGHT - 1, width - 1, 1).fill(bottomEdge)
    .rect(ROW_LEFT + width - 1, 0, 1, BANK_ROW_HEIGHT).fill(0x1b1027)
    .rect(ROW_LEFT + 1, 1, INDEX_COLUMN_WIDTH - 2, BANK_ROW_HEIGHT - 3)
      .fill(selected ? 0xf2b954 : 0x3b224c)
    .rect(ROW_LEFT + 2, 2, INDEX_COLUMN_WIDTH - 4, 1)
      .fill(selected ? 0xffdf8a : 0x54356e)
    .rect(ROW_LEFT + 2, BANK_ROW_HEIGHT - 3, INDEX_COLUMN_WIDTH - 4, 1)
      .fill(selected ? 0x9a5b3c : 0x241331)
    .rect(ROW_LEFT, 0, INDEX_COLUMN_WIDTH, 1).fill(topEdge)
    .rect(ROW_LEFT, 0, 1, BANK_ROW_HEIGHT - 1).fill(topEdge)
    .rect(ROW_LEFT, BANK_ROW_HEIGHT - 1, INDEX_COLUMN_WIDTH, 1).fill(bottomEdge)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH - 1, 0, 1, BANK_ROW_HEIGHT - 1).fill(divider)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH, 0, 1, BANK_ROW_HEIGHT - 1).fill(divider)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH + 1, 1, 1, BANK_ROW_HEIGHT - 3).fill(selected ? 0x9a5b3c : 0x1d0e2a);
  if (selected) {
    row.rect(NAME_LEFT + 1, 3, 2, 8).fill(0x4c2e38);
    // Reference row 04 shimmer: a few white sparkle pixels on the gold.
    row.rect(NAME_LEFT + 26, 4, 1, 1).fill(0xfff6d8)
      .rect(NAME_LEFT + 29, 6, 1, 1).fill(0xfff6d8)
      .rect(width - 26, 3, 1, 1).fill(0xfff6d8);
  }
  return row;
}

function createIndex(index: number, selected: boolean): Text {
  const label = createText(String(index + 1).padStart(2, '0'), selected ? 0x392044 : 0xffeaff);
  label.anchor.set(0, 0.5);
  label.position.set(ROW_LEFT + 10, BANK_ROW_HEIGHT / 2 - 1);
  return label;
}

function createName(name: string, selected: boolean): Text {
  const color = selected ? 0x392044 : name === 'empty' ? 0x8d6ba0 : 0xffeaff;
  const label = new Text({
    text: name,
    style: { fontFamily: 'monogram', fontSize: 15, fill: color }, resolution: 3,
  });
  label.anchor.set(0, 0.5);
  label.position.set(NAME_LEFT + 4, BANK_ROW_HEIGHT / 2 - 1);
  return label;
}

function createPreviewGlyph(width: number, selected: boolean): Text {
  const label = new Text({
    text: '▶',
    style: { fontFamily: 'monogram', fontSize: 11, fill: selected ? 0x392044 : 0xd26ff7 }, resolution: 3,
  });
  label.anchor.set(0, 0.5);
  label.position.set(width - 16, BANK_ROW_HEIGHT / 2);
  return label;
}

function createText(value: string, color: number): Text {
  return new Text({
    text: value,
    style: { fontFamily: 'monogram', fontSize: 15, fill: color }, resolution: 3,
  });
}
