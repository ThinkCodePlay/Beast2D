import type { SoundBank } from "../bank";
import type { SoundSequence } from "../audio/model";
import { parseSoundFile, serializeSound, soundFileName } from "../soundFile";
import type { BankSnapshot } from "../bankStorage";
import { BANK_FILE_NAME, parseBankFile, serializeBankFile } from "../bankFile";

/**
 * The DOM side of the bank strip's import/export buttons, single-sound and
 * whole-bank: downloads and file picking. Pixi-free and renderer-agnostic,
 * so the 2D panel and the 3D scene share it exactly; only their buttons
 * differ. Mirrors the name editor's approach of using plain DOM for
 * anything the OS must see (file dialogs, downloads).
 */

/** The four actions the bank panel's strip buttons trigger. */
export interface SoundTransfer {
  /** Download the selected slot's sound as a JSON file named after it. */
  exportSelected(): void;
  /**
   * Pick a JSON sound file and load it into the selected slot, after a
   * confirmation, since the slot's current sound is replaced. Alerts and
   * does nothing when the file is not a valid sound.
   */
  importSelected(): void;
  /**
   * Download the whole bank - every slot, the selection and the loop latch -
   * as one pretty-printed JSON file.
   */
  exportBank(): void;
  /**
   * Pick a whole-bank JSON file and restore it, after a confirmation, since
   * every current slot is replaced. Alerts and does nothing when the file is
   * not a valid bank; a cancelled picker or dialog changes nothing.
   */
  importBank(): void;
}

/** The board's loop latch, which a whole-bank file carries and restores. */
export interface BankLoopLatch {
  isLooping(): boolean;
  setLooping(looping: boolean): void;
}

/**
 * Wire import/export to a bank and the editor's live sequence. The export
 * reads the live sequence, not the slot's stored copy: while a slot is
 * selected its edits live in the sequence and only copy back on switch. The
 * whole-bank export goes through the bank's slot snapshot, which folds the
 * live edits in the same way.
 */
export function createSoundTransfer(
  bank: SoundBank,
  liveSequence: SoundSequence,
  loop: BankLoopLatch,
): SoundTransfer {
  return {
    exportSelected(): void {
      downloadTextFile(
        soundFileName(bank.selectedName),
        serializeSound(bank.selectedName, liveSequence),
      );
    },
    importSelected(): void {
      void importIntoSelected(bank);
    },
    exportBank(): void {
      downloadTextFile(
        BANK_FILE_NAME,
        serializeBankFile(bank, loop.isLooping()),
      );
    },
    importBank(): void {
      void importWholeBank(bank, loop);
    },
  };
}

/** The import flow: pick, parse, confirm the overwrite, then replace. */
async function importIntoSelected(bank: SoundBank): Promise<void> {
  const file = await pickJsonFile();
  if (!file) return; // The picker was cancelled; nothing to do.
  let parsed: { name: string; sound: SoundSequence };
  try {
    parsed = parseSoundFile(await file.text());
  } catch (error) {
    window.alert(
      `Could not import: ${error instanceof Error ? error.message : "not a valid sound file."}`,
    );
    return;
  }
  const incoming = parsed.name || bank.selectedName;
  const message =
    incoming === bank.selectedName
      ? `Replace the sound in "${bank.selectedName}"?`
      : `Replace "${bank.selectedName}" with "${incoming}"?`;
  if (!window.confirm(message)) return;
  bank.replaceSelected(parsed.sound, parsed.name);
}

/** The bank import flow: pick, parse, confirm the replacement, then restore. */
async function importWholeBank(
  bank: SoundBank,
  loop: BankLoopLatch,
): Promise<void> {
  const file = await pickJsonFile();
  if (!file) return; // The picker was cancelled; nothing to do.
  let snapshot: BankSnapshot;
  try {
    snapshot = parseBankFile(await file.text());
  } catch (error) {
    window.alert(
      `Could not import the bank: ${error instanceof Error ? error.message : "not a valid bank file."}`,
    );
    return;
  }
  const confirmed = window.confirm(
    `Replace the whole sound bank with "${file.name}"? Every current sound will be replaced.`,
  );
  if (!confirmed) return;
  // Apply the latch first: restore's change notification refreshes the
  // views, and the loop button re-reads the latch during that refresh.
  loop.setLooping(snapshot.looping);
  // One undo step: Undo brings back the whole pre-import bank.
  bank.beginEdit();
  bank.restore(snapshot.slots, snapshot.selectedIndex);
  bank.endEdit();
}

/** Download text as a file through a temporary anchor. */
function downloadTextFile(filename: string, text: string): void {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Open the file picker for one JSON file; resolves null when cancelled. */
function pickJsonFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => resolve(input.files?.[0] ?? null));
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}
