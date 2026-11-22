import type { SoundBank } from "../bank";
import type { SoundSequence } from "../audio/model";
import { parseSoundFile, serializeSound, soundFileName } from "../soundFile";

/**
 * The DOM side of the bank's import/export buttons: downloads and file
 * picking. Pixi-free and renderer-agnostic, so the 2D panel and the 3D scene
 * share it exactly; only their buttons differ. Mirrors the name editor's
 * approach of using plain DOM for anything the OS must see (file dialogs,
 * downloads).
 */

/** The two actions the bank panel's import/export buttons trigger. */
export interface SoundTransfer {
  /** Download the selected slot's sound as a JSON file named after it. */
  exportSelected(): void;
  /**
   * Pick a JSON sound file and load it into the selected slot, after a
   * confirmation, since the slot's current sound is replaced. Alerts and
   * does nothing when the file is not a valid sound.
   */
  importSelected(): void;
}

/**
 * Wire import/export to a bank and the editor's live sequence. The export
 * reads the live sequence, not the slot's stored copy: while a slot is
 * selected its edits live in the sequence and only copy back on switch.
 */
export function createSoundTransfer(
  bank: SoundBank,
  liveSequence: SoundSequence,
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
      ? `Replace the sound in "${bank.selectedName}"? This cannot be undone.`
      : `Replace "${bank.selectedName}" with "${incoming}"? This cannot be undone.`;
  if (!window.confirm(message)) return;
  bank.replaceSelected(parsed.sound, parsed.name);
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
