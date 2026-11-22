import { Container, Graphics, Text, type FederatedPointerEvent } from "pixi.js";
import { makePressable } from "../ui/Pressable";
import type { ControlMode } from "../controls";
import type { SoundBank } from "../bank";
import type { SoundTransfer } from "../ui/soundFileTransfer";
import { VISIBLE_SLOT_ROWS } from "../bank";
import { BANK_ROW_TOP, BankRows } from "./BankRows";
import { BANK_STRIP_BUTTON_SIZE, BankStripButton } from "./BankStripButton";

/** Panel width kept clear of the rows (the scrollbar's side). */
export const ROWS_WIDTH_INSET = 24;
export const SCROLL_BUTTON_SIZE = 15;
export const SCROLL_INSET = 2;
export const SCROLL_TRACK_TOP = BANK_ROW_TOP;

/**
 * The strip buttons (whole-bank import/export, undo/redo, single-sound
 * import/export) sit on the panel's subtitle strip.
 */
export const IO_BUTTON_TOP = 16;
export const IO_BUTTON_GAP = 2;

/**
 * The buttons' x positions inside the panel: single-sound export rightmost,
 * then import, redo and undo, with the whole-bank export/import pair
 * leftmost. Shared with the 3D layout so the meshes land on the same spots.
 */
export function stripButtonXs(width: number): {
  bankImportX: number;
  bankExportX: number;
  undoX: number;
  redoX: number;
  importX: number;
  exportX: number;
} {
  const exportX = width - SCROLL_INSET - BANK_STRIP_BUTTON_SIZE;
  const importX = exportX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP;
  const redoX = importX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP;
  const undoX = redoX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP;
  const bankExportX = undoX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP;
  return {
    bankImportX: bankExportX - BANK_STRIP_BUTTON_SIZE - IO_BUTTON_GAP,
    bankExportX,
    undoX,
    redoX,
    importX,
    exportX,
  };
}

/** Shallow inset sound-bank area with a fine board-colored boundary. */
export class SoundBankPanel extends Container {
  constructor(
    width: number,
    height: number,
    bank: SoundBank | undefined,
    controls: ControlMode = "2d",
    io?: SoundTransfer,
  ) {
    super();
    this.addChild(drawFlatBoundary(width, height));
    this.addChild(createTitle());
    // In '3d' mode the rows and strip buttons are left out so the 3D
    // scene can draw and hit-test its own (see three/BankRows3D.ts and
    // BANK_STRIP_BUTTONS in three/controlLayout.ts).
    if (controls === "2d") {
      if (!bank)
        throw new Error("SoundBankPanel 2D mode needs the sound bank.");
      const rows = new BankRows(bank, width - ROWS_WIDTH_INSET, true);
      rows.position.set(0, BANK_ROW_TOP);
      this.addChild(rows);
      this.addChild(...createStripButtons(width, bank, io));
    }
    this.addChild(createScrollbar(width, height, controls, this, bank));
  }
}

/**
 * The strip buttons: the whole-bank import/export pair leftmost, undo and
 * redo in the middle (greyed out while they have nothing to restore), then
 * the single-sound import/export. All wired only when a transfer is
 * provided, except undo/redo, which work on the bank alone.
 */
function createStripButtons(
  width: number,
  bank: SoundBank,
  io?: SoundTransfer,
): BankStripButton[] {
  const { bankImportX, bankExportX, undoX, redoX, importX, exportX } =
    stripButtonXs(width);
  const undoButton = new BankStripButton("undo", () => bank.undo());
  undoButton.position.set(undoX, IO_BUTTON_TOP);
  undoButton.setEnabled(bank.canUndo);
  const redoButton = new BankStripButton("redo", () => bank.redo());
  redoButton.position.set(redoX, IO_BUTTON_TOP);
  redoButton.setEnabled(bank.canRedo);
  bank.onChange(() => {
    undoButton.setEnabled(bank.canUndo);
    redoButton.setEnabled(bank.canRedo);
  });
  const buttons = [undoButton, redoButton];
  if (io) {
    const bankImportButton = new BankStripButton("bankImport", io.importBank);
    bankImportButton.position.set(bankImportX, IO_BUTTON_TOP);
    const bankExportButton = new BankStripButton("bankExport", io.exportBank);
    bankExportButton.position.set(bankExportX, IO_BUTTON_TOP);
    const importButton = new BankStripButton("import", io.importSelected);
    importButton.position.set(importX, IO_BUTTON_TOP);
    const exportButton = new BankStripButton("export", io.exportSelected);
    exportButton.position.set(exportX, IO_BUTTON_TOP);
    buttons.push(
      bankImportButton,
      bankExportButton,
      importButton,
      exportButton,
    );
  }
  return buttons;
}

function drawFlatBoundary(width: number, height: number): Graphics {
  return new Graphics()
    .rect(0, 0, width, height)
    .fill(0x2b153c)
    .rect(0, 0, width, 1)
    .fill(0x76508c)
    .rect(0, 0, 1, height)
    .fill(0x76508c)
    .rect(width - 1, 1, 1, height - 2)
    .fill(0x2a1738)
    .rect(1, height - 1, width - 1, 1)
    .fill(0x2a1738)
    .rect(1, 1, 1, 1)
    .fill(0xd88ce7)
    .rect(width - 2, height - 2, 1, 1)
    .fill(0x20132b)
    .rect(3, 16, width - 6, 13)
    .fill(0x472b5c)
    .rect(3, 16, width - 6, 1)
    .fill(0x5c3a73)
    .rect(1, 33, width - 2, 1)
    .fill(0x56316b);
}

function createTitle(): Text {
  const title = new Text({
    text: "SOUND BANK",
    style: {
      fontFamily: "monogram",
      fontSize: 18,
      fontWeight: "bold",
      fill: 0xffeaff,
      stroke: { color: 0x2a1440, width: 1 },
    },
    resolution: 3,
  });
  title.position.set(6, -2);
  return title;
}

/**
 * Track interior the thumb travels in: between the arrow buttons, inside the
 * track's 2px highlight.
 */
function trackInterior(height: number): { top: number; height: number } {
  const top = BANK_ROW_TOP + SCROLL_BUTTON_SIZE + 2;
  return {
    top,
    height: height - BANK_ROW_TOP - SCROLL_INSET - SCROLL_BUTTON_SIZE * 2 - 4,
  };
}

/**
 * The bank scrollbar. In 3D mode it is track art only: the scene draws the
 * thumb itself so it can move with the bank (see three/ScrollbarThumb3D).
 * In 2D mode it is the live control: arrow buttons step the row window, the
 * thumb sizes to the visible share, tracks the bank's scroll offset and
 * drags to scroll.
 */
function createScrollbar(
  width: number,
  height: number,
  controls: ControlMode,
  dragHost: Container,
  bank?: SoundBank,
): Container {
  const x = width - SCROLL_BUTTON_SIZE - SCROLL_INSET;
  const y = BANK_ROW_TOP;
  const trackHeight = height - y - SCROLL_INSET;
  const interior = trackInterior(height);
  const scrollbar = new Container();
  // Reference scrollbar: one wide light-lavender track.
  scrollbar.addChild(
    new Graphics()
      .rect(
        x,
        y + SCROLL_BUTTON_SIZE,
        SCROLL_BUTTON_SIZE,
        trackHeight - SCROLL_BUTTON_SIZE * 2,
      )
      .fill(0x1b1027)
      .rect(
        x + 1,
        y + SCROLL_BUTTON_SIZE + 1,
        SCROLL_BUTTON_SIZE - 2,
        trackHeight - SCROLL_BUTTON_SIZE * 2 - 2,
      )
      .fill(0xa581ba)
      .rect(
        x + 2,
        y + SCROLL_BUTTON_SIZE + 2,
        2,
        trackHeight - SCROLL_BUTTON_SIZE * 2 - 4,
      )
      .fill(0xd4bedc),
  );
  if (controls === "2d") {
    if (!bank) throw new Error("SoundBankPanel 2D mode needs the sound bank.");
    const thumb = new ScrollThumb(interior.height);
    thumb.position.set(x + 4, interior.top);
    thumb.eventMode = "static";
    thumb.cursor = "pointer";
    thumb.on("pointerdown", (event: FederatedPointerEvent) => {
      const grabY = event.getLocalPosition(scrollbar).y - thumb.position.y;
      const move = (e: FederatedPointerEvent): void => {
        const travel = interior.height - thumb.height;
        const ratio =
          travel <= 0
            ? 0
            : (e.getLocalPosition(scrollbar).y - interior.top - grabY) / travel;
        bank.setScrollOffset(ratio * bank.maxScrollOffset);
      };
      const end = (): void => {
        dragHost.off("pointermove", move);
        dragHost.off("pointerup", end);
        dragHost.off("pointerupoutside", end);
      };
      // Track the drag on the panel so it survives leaving the scrollbar.
      dragHost.eventMode = "static";
      dragHost.on("pointermove", move);
      dragHost.on("pointerup", end);
      dragHost.on("pointerupoutside", end);
    });
    const syncThumb = (): void => {
      const share = Math.min(1, VISIBLE_SLOT_ROWS / bank.slots.length);
      const thumbHeight = Math.max(10, Math.round(interior.height * share));
      const travel = interior.height - thumbHeight;
      thumb.setSize(thumbHeight);
      thumb.position.y =
        interior.top +
        (bank.maxScrollOffset === 0
          ? 0
          : (bank.scrollOffset / bank.maxScrollOffset) * travel);
    };
    syncThumb();
    bank.onChange(syncThumb);
    const up = new ScrollArrowButton(true);
    up.position.set(x, y);
    up.on("pointertap", () => bank.setScrollOffset(bank.scrollOffset - 1));
    const down = new ScrollArrowButton(false);
    down.position.set(x, height - SCROLL_BUTTON_SIZE - SCROLL_INSET);
    down.on("pointertap", () => bank.setScrollOffset(bank.scrollOffset + 1));
    scrollbar.addChild(thumb, up, down);
  }
  return scrollbar;
}

/** The darker inset thumb, resized to the window's share of the bank. */
class ScrollThumb extends Container {
  private thumbHeight: number;

  constructor(initialHeight: number) {
    super();
    this.thumbHeight = initialHeight;
    this.draw();
  }

  setSize(thumbHeight: number): void {
    if (thumbHeight === this.thumbHeight) return;
    this.thumbHeight = thumbHeight;
    this.draw();
  }

  private draw(): void {
    this.removeChildren().forEach((child) => child.destroy());
    this.addChild(
      new Graphics()
        .rect(0, 0, SCROLL_BUTTON_SIZE - 8, this.thumbHeight)
        .fill(0x8a63a0)
        .rect(0, 0, SCROLL_BUTTON_SIZE - 8, 1)
        .fill(0xb18cc4)
        // A grab area a little taller than the art keeps short thumbs draggable.
        .rect(-2, 0, SCROLL_BUTTON_SIZE - 4, Math.max(this.thumbHeight, 12))
        .fill({ color: 0xffffff, alpha: 0 }),
    );
  }
}

/** Small square bank-scroll button with a chunky arrow glyph. */
export class ScrollArrowButton extends Container {
  constructor(up: boolean) {
    super();
    this.addChild(
      new Graphics()
        .rect(1, 1, 14, 14)
        .fill(0x301b42)
        .rect(0, 0, 14, 14)
        .fill(0xc7b3d9)
        .rect(1, 1, 12, 2)
        .fill(0xe8dcf2)
        .rect(1, 1, 2, 12)
        .fill(0xe8dcf2)
        .rect(11, 2, 2, 11)
        .fill(0x8a63a0),
    );
    const glyph = new Graphics();
    if (up) {
      glyph.poly([7, 4, 11, 10, 3, 10]).fill(0x281638);
    } else {
      glyph.poly([3, 4, 11, 4, 7, 10]).fill(0x281638);
    }
    this.addChild(glyph);
    makePressable(this, { pressDepth: 1 });
  }
}
