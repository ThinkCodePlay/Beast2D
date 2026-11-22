import { test } from "vitest";
import assert from "node:assert/strict";
import { SoundBank } from "../src/shared/bank.js";
import {
  createSoundSequence,
  SEQUENCE_STEP_COUNT,
} from "../src/shared/audio/model.js";
import {
  BANK_STORAGE_FORMAT,
  BANK_STORAGE_VERSION,
  parseBankSnapshot,
  serializeBank,
} from "../src/shared/bankStorage.js";
import {
  BANK_FILE_NAME,
  parseBankFile,
  serializeBankFile,
} from "../src/shared/bankFile.js";

function makeBank(): {
  bank: SoundBank;
  live: ReturnType<typeof createSoundSequence>;
} {
  const bank = new SoundBank(() => createSoundSequence(), 3);
  const live = createSoundSequence();
  bank.activate(live);
  return { bank, live };
}

test("a bank file round-trips the whole bank into a fresh board", () => {
  const { bank, live } = makeBank();
  live.waveform = "saw"; // a live edit not yet in the slot's stored copy
  live.steps[0].note = 60.5; // fractional grid positions survive exactly
  bank.rename("my_sound");
  bank.addSlot(); // fills the first empty placeholder: a non-default bank
  bank.select(0);
  const snapshot = parseBankFile(serializeBankFile(bank, true));
  assert.equal(snapshot.slots.length, 16);
  assert.equal(snapshot.selectedIndex, 0);
  assert.equal(snapshot.looping, true);
  assert.equal(snapshot.slots[3].name, "my_sound");
  assert.equal(snapshot.slots[3].sound.waveform, "saw");
  assert.equal(snapshot.slots[3].sound.steps[0].note, 60.5);
  assert.equal(snapshot.slots[8].empty, false);
  assert.equal(snapshot.slots[8].name, "sound_09");
  const { bank: fresh, live: freshLive } = makeBank();
  fresh.restore(snapshot.slots, snapshot.selectedIndex);
  assert.equal(fresh.selectedIndex, 0);
  assert.equal(fresh.selectedName, "jump");
  assert.equal(freshLive.waveform, fresh.slots[0].sound.waveform);
  assert.deepEqual(
    fresh.copySlots().map((slot) => [slot.name, slot.empty, slot.sound]),
    bank.copySlots().map((slot) => [slot.name, slot.empty, slot.sound]),
  );
  assert.equal(
    fresh.slots[0].sound.steps.length,
    SEQUENCE_STEP_COUNT,
    "every step survives",
  );
});

test("a bank file is pretty-printed for hand editing, under a fixed name", () => {
  const { bank } = makeBank();
  const text = serializeBankFile(bank, false);
  assert.equal(BANK_FILE_NAME, "beast2d-sound-bank.json");
  assert.ok(text.endsWith("\n"));
  assert.ok(text.split("\n").length > 100, "indented one value per line");
  const data = JSON.parse(text) as { format: string; version: number };
  assert.equal(data.format, BANK_STORAGE_FORMAT);
  assert.equal(data.version, BANK_STORAGE_VERSION);
});

test("bank files and storage snapshots share one envelope", () => {
  const { bank } = makeBank();
  bank.rename("shared");
  // The compact autosave text imports as a bank file unchanged.
  const fromStorage = parseBankFile(serializeBank(bank, true));
  assert.equal(fromStorage.looping, true);
  assert.equal(fromStorage.slots[3].name, "shared");
  // And the pretty file parses through the storage path unchanged.
  const fromFile = parseBankSnapshot(serializeBankFile(bank, false));
  assert.equal(fromFile.looping, false);
  assert.equal(fromFile.selectedIndex, 3);
  assert.equal(fromFile.slots[3].name, "shared");
});

test("invalid bank files are rejected with file-worded errors", () => {
  assert.throws(
    () => parseBankFile("not json"),
    /The file is not valid JSON\./,
  );
  // A single-sound file is not a bank file.
  assert.throws(
    () => parseBankFile('{"format":"beast2d-sound","version":1}'),
    /The file is not a Beast2D sound bank snapshot\./,
  );
  assert.throws(
    () =>
      parseBankFile(
        JSON.stringify({ format: BANK_STORAGE_FORMAT, version: 99 }),
      ),
    /version 99/,
  );
  assert.throws(
    () =>
      parseBankFile(
        JSON.stringify({
          format: BANK_STORAGE_FORMAT,
          version: BANK_STORAGE_VERSION,
          slots: [],
        }),
      ),
    /The file holds no slots\./,
  );
  const badSlot = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    slots: [{ empty: false, sound: {} }],
  };
  assert.throws(
    () => parseBankFile(JSON.stringify(badSlot)),
    /Slot 1 has no name\./,
  );
  const badSound = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    slots: [{ name: "x", empty: false, sound: { steps: [] } }],
  };
  assert.throws(
    () => parseBankFile(JSON.stringify(badSound)),
    new RegExp(`exactly ${SEQUENCE_STEP_COUNT} steps`),
  );
});
