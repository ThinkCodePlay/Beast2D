import type { SoundBank } from "./bank.js";
import {
  bankSnapshotData,
  parseBankSnapshotLabeled,
  type BankSnapshot,
} from "./bankStorage.js";

/**
 * The whole-bank file format behind the bank strip's bank import/export
 * buttons: every slot's name, empty flag and sound, plus the selection and
 * the loop latch, as one downloadable JSON document. The envelope is the
 * persistence snapshot's, so a downloaded bank file and a saved snapshot are
 * interchangeable; only the layout differs - the file is pretty-printed for
 * hand editing, like the single-sound files, while localStorage stays
 * compact. Pixi-free, like the other format modules.
 */

/** The download's fixed name; the browser renames duplicates on its own. */
export const BANK_FILE_NAME = "beast2d-sound-bank.json";

/** Serialize the whole bank and the loop latch, pretty-printed. */
export function serializeBankFile(bank: SoundBank, looping: boolean): string {
  return `${JSON.stringify(bankSnapshotData(bank, looping), null, 2)}\n`;
}

/**
 * Parse a bank file's text. Validation follows the snapshot format exactly,
 * with the file named as the source in errors. Throws an Error with a
 * user-readable message when the file is not valid JSON, not this format, a
 * newer version, or holds out-of-shape values.
 */
export function parseBankFile(text: string): BankSnapshot {
  return parseBankSnapshotLabeled(text, "The file");
}
