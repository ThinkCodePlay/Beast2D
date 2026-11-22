import { Container, Graphics, Text } from "pixi.js";

export const BANK_ROW_HEIGHT = 40 / 3;
const ROW_LEFT = 4;
const NAME_LEFT = 36;
const INDEX_COLUMN_WIDTH = 32;

/** Edge of a filled row's small action buttons (duplicate, delete). */
export const ROW_ACTION_SIZE = 11;
const ROW_ACTION_GAP = 2;
const ROW_ACTION_RIGHT_INSET = 2;

/**
 * A filled row's duplicate and delete buttons, right-aligned inside the row
 * face, in row-local coordinates. Shared with BankRows' tap routing and the
 * 3D scene, so the drawn buttons and their hit zones can never drift apart.
 */
export function rowActionZones(rowWidth: number): {
  duplicate: { x: number; y: number; size: number };
  delete: { x: number; y: number; size: number };
} {
  const y = Math.round((BANK_ROW_HEIGHT - ROW_ACTION_SIZE) / 2);
  const deleteX =
    ROW_LEFT + rowWidth - ROW_ACTION_RIGHT_INSET - ROW_ACTION_SIZE;
  return {
    duplicate: {
      x: deleteX - ROW_ACTION_GAP - ROW_ACTION_SIZE,
      y,
      size: ROW_ACTION_SIZE,
    },
    delete: { x: deleteX, y, size: ROW_ACTION_SIZE },
  };
}

/** Whether a row-local x lands on one of the row's action buttons. */
export function rowActionAt(
  rowWidth: number,
  x: number,
): "duplicate" | "delete" | null {
  const zones = rowActionZones(rowWidth);
  for (const action of ["duplicate", "delete"] as const) {
    const zone = zones[action];
    if (x >= zone.x - 1 && x <= zone.x + zone.size + 1) return action;
  }
  return null;
}

/**
 * One numbered sound-bank slot with an individual thin outline and cell
 * rules. Filled rows carry small duplicate and delete buttons on their right
 * edge. Redraws itself when its selection state changes.
 */
export class SoundBankRow extends Container {
  private selected: boolean;
  private slotName: string;

  constructor(
    private readonly index: number,
    slotName: string,
    selected: boolean,
    private readonly rowWidth: number,
    private readonly actions = false,
  ) {
    super();
    this.slotName = slotName;
    this.selected = selected;
    this.draw();
  }

  /** Redraw with a new selection state. */
  setSelected(selected: boolean): void {
    if (selected === this.selected) return;
    this.selected = selected;
    this.draw();
  }

  /** Redraw with a new slot name (renamed on the LCD). */
  setName(name: string): void {
    if (name === this.slotName) return;
    this.slotName = name;
    this.draw();
  }

  private draw(): void {
    this.removeChildren().forEach((child) => child.destroy());
    this.addChild(drawRow(this.selected, this.rowWidth));
    this.addChild(createIndex(this.index, this.selected));
    this.addChild(createName(this.slotName, this.selected));
    if (this.actions) {
      const zones = rowActionZones(this.rowWidth);
      this.addChild(drawActionButton(zones.duplicate, this.selected, "copy"));
      this.addChild(drawActionButton(zones.delete, this.selected, "delete"));
    }
  }
}

/** One small square row-action button with a chunky glyph. */
function drawActionButton(
  zone: { x: number; y: number; size: number },
  selected: boolean,
  kind: "copy" | "delete",
): Graphics {
  const face = selected ? 0xf2b954 : 0x1b1027;
  const edge = selected ? 0x9a5b3c : 0x3f2652;
  const ink = selected ? 0x392044 : 0xb88acb;
  const button = new Graphics()
    .rect(zone.x, zone.y, zone.size, zone.size)
    .fill(face)
    .rect(zone.x, zone.y, zone.size, 1)
    .fill(edge)
    .rect(zone.x, zone.y + zone.size - 1, zone.size, 1)
    .fill(edge)
    .rect(zone.x, zone.y, 1, zone.size)
    .fill(edge)
    .rect(zone.x + zone.size - 1, zone.y, 1, zone.size)
    .fill(edge);
  const gx = zone.x + 2;
  const gy = zone.y + 2;
  if (kind === "copy") {
    // Two overlapping slot faces: the copy in front, down-left.
    button
      .rect(gx + 2, gy, 5, 5)
      .fill(ink)
      .rect(gx + 3, gy + 1, 3, 3)
      .fill(face)
      .rect(gx, gy + 2, 5, 5)
      .fill(ink)
      .rect(gx + 1, gy + 3, 3, 3)
      .fill(face);
  } else {
    // A diagonal-pixel cross.
    for (let i = 0; i < 7; i += 1) {
      button
        .rect(gx + i, gy + i, 1, 1)
        .fill(ink)
        .rect(gx + 6 - i, gy + i, 1, 1)
        .fill(ink);
    }
  }
  return button;
}

function drawRow(selected: boolean, width: number): Graphics {
  const face = selected ? 0xfdd154 : 0x2c163a;
  const topEdge = selected ? 0xffe18a : 0x4a2c5e;
  const bottomEdge = selected ? 0x9a5b3c : 0x1e0f2c;
  const divider = selected ? 0x9a5b3c : 0x43295a;
  const row = new Graphics()
    .rect(ROW_LEFT + 1, 1, width - 1, BANK_ROW_HEIGHT - 1)
    .fill(0x1b1027)
    .rect(ROW_LEFT, 0, width - 1, BANK_ROW_HEIGHT - 1)
    .fill(face)
    .rect(ROW_LEFT, 0, width - 1, 1)
    .fill(topEdge)
    .rect(ROW_LEFT, 0, 1, BANK_ROW_HEIGHT - 1)
    .fill(topEdge)
    .rect(ROW_LEFT, BANK_ROW_HEIGHT - 1, width - 1, 1)
    .fill(bottomEdge)
    .rect(ROW_LEFT + width - 1, 0, 1, BANK_ROW_HEIGHT)
    .fill(0x1b1027)
    .rect(ROW_LEFT + 1, 1, INDEX_COLUMN_WIDTH - 2, BANK_ROW_HEIGHT - 3)
    .fill(selected ? 0xf2b954 : 0x3b224c)
    .rect(ROW_LEFT + 2, 2, INDEX_COLUMN_WIDTH - 4, 1)
    .fill(selected ? 0xffdf8a : 0x54356e)
    .rect(ROW_LEFT + 2, BANK_ROW_HEIGHT - 3, INDEX_COLUMN_WIDTH - 4, 1)
    .fill(selected ? 0x9a5b3c : 0x241331)
    .rect(ROW_LEFT, 0, INDEX_COLUMN_WIDTH, 1)
    .fill(topEdge)
    .rect(ROW_LEFT, 0, 1, BANK_ROW_HEIGHT - 1)
    .fill(topEdge)
    .rect(ROW_LEFT, BANK_ROW_HEIGHT - 1, INDEX_COLUMN_WIDTH, 1)
    .fill(bottomEdge)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH - 1, 0, 1, BANK_ROW_HEIGHT - 1)
    .fill(divider)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH, 0, 1, BANK_ROW_HEIGHT - 1)
    .fill(divider)
    .rect(ROW_LEFT + INDEX_COLUMN_WIDTH + 1, 1, 1, BANK_ROW_HEIGHT - 3)
    .fill(selected ? 0x9a5b3c : 0x1d0e2a);
  if (selected) {
    row.rect(NAME_LEFT + 1, 3, 2, 8).fill(0x4c2e38);
    // Reference row 04 shimmer: a few white sparkle pixels on the gold.
    row
      .rect(NAME_LEFT + 26, 4, 1, 1)
      .fill(0xfff6d8)
      .rect(NAME_LEFT + 29, 6, 1, 1)
      .fill(0xfff6d8)
      .rect(width - 26, 3, 1, 1)
      .fill(0xfff6d8);
  }
  return row;
}

function createIndex(index: number, selected: boolean): Text {
  const label = createText(
    String(index + 1).padStart(2, "0"),
    selected ? 0x392044 : 0xffeaff,
  );
  label.anchor.set(0, 0.5);
  label.position.set(ROW_LEFT + 10, BANK_ROW_HEIGHT / 2 - 1);
  return label;
}

function createName(name: string, selected: boolean): Text {
  const color = selected ? 0x392044 : name === "empty" ? 0x8d6ba0 : 0xffeaff;
  const label = new Text({
    text: name,
    style: { fontFamily: "monogram", fontSize: 15, fill: color },
    resolution: 3,
  });
  label.anchor.set(0, 0.5);
  label.position.set(NAME_LEFT + 4, BANK_ROW_HEIGHT / 2 - 1);
  return label;
}

function createText(value: string, color: number): Text {
  return new Text({
    text: value,
    style: { fontFamily: "monogram", fontSize: 15, fill: color },
    resolution: 3,
  });
}
