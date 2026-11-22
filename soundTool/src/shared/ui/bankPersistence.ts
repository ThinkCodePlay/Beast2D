import type { SoundBank } from "../bank";
import {
  BANK_STORAGE_KEY,
  CORRUPT_BACKUP_PREFIX,
  parseBankSnapshot,
  serializeBank,
} from "../bankStorage";

/**
 * The bank's localStorage persistence, wired by each renderer's composition
 * root: restore once at startup, then autosave on an interval and when the
 * page hides. DOM-touching like soundFileTransfer; the format itself lives
 * in Pixi-free bankStorage.ts.
 *
 * Safety rules:
 * - A corrupt snapshot is never silently overwritten: its raw text is first
 *   copied to a timestamped backup key, and the user is told the board
 *   started fresh. The main key is only replaced by the next successful
 *   autosave, and if even the backup copy fails the main key stays untouched.
 * - A write failure (quota, blocked storage) is surfaced once per session.
 * - Saves that would write identical bytes are skipped.
 */

/** How to tell the user something, defaulting to the board's alert pattern. */
type Alert = (message: string) => void;

/**
 * Read the snapshot and load it into the bank. Returns the saved loop latch
 * (false when there is nothing usable to restore). A corrupt snapshot is
 * preserved aside and reported; the board keeps its fresh state.
 */
export function restoreBankSnapshot(
  bank: SoundBank,
  alert: Alert = (message) => window.alert(message),
): boolean {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BANK_STORAGE_KEY);
  } catch {
    return false; // Storage unavailable at all (private mode, blocked): run unsaved.
  }
  if (raw === null) return false;
  try {
    const snapshot = parseBankSnapshot(raw);
    bank.restore(snapshot.slots, snapshot.selectedIndex);
    return snapshot.looping;
  } catch (error) {
    let backupKept = false;
    try {
      window.localStorage.setItem(
        `${CORRUPT_BACKUP_PREFIX}${new Date().toISOString()}`,
        raw,
      );
      backupKept = true;
    } catch {
      // The backup copy failed too; the main key stays untouched as the last resort.
    }
    const reason = error instanceof Error ? ` (${error.message})` : "";
    alert(
      backupKept
        ? `The saved sound bank could not be restored${reason}. A backup copy of the saved data was kept in this browser, and the board started fresh.`
        : `The saved sound bank could not be restored${reason}, and a backup copy could not be written either; the saved data was left untouched and the board started fresh.`,
    );
    return false;
  }
}

/**
 * Save the bank every few seconds and when the page hides. Writes only when
 * the snapshot changed; a storage failure alerts once per session.
 */
export function startBankAutosave(
  bank: SoundBank,
  isLooping: () => boolean,
  alert: Alert = (message) => window.alert(message),
): void {
  let lastSaved: string | null = null;
  let failureAlerted = false;
  const save = (): void => {
    let text: string;
    try {
      text = serializeBank(bank, isLooping());
    } catch {
      return; // A sound that cannot serialize should not kill the page's teardown.
    }
    if (text === lastSaved) return;
    try {
      window.localStorage.setItem(BANK_STORAGE_KEY, text);
      lastSaved = text;
    } catch {
      if (!failureAlerted) {
        failureAlerted = true;
        alert(
          "The sound bank could not be saved in this browser; your changes will be lost when the page closes.",
        );
      }
    }
  };
  window.setInterval(save, 3000);
  window.addEventListener("pagehide", save);
}
