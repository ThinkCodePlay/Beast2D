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

function makeBank(): {
  bank: SoundBank;
  live: ReturnType<typeof createSoundSequence>;
} {
  const bank = new SoundBank(() => createSoundSequence(), 3);
  const live = createSoundSequence();
  bank.activate(live);
  return { bank, live };
}

test("a snapshot round-trips every slot, the selection and the loop latch", () => {
  const { bank, live } = makeBank();
  live.waveform = "saw"; // a live edit not yet in the slot's stored copy
  bank.rename("my_sound");
  bank.select(0);
  const text = serializeBank(bank, true);
  const snapshot = parseBankSnapshot(text);
  assert.equal(snapshot.slots.length, 16);
  assert.equal(snapshot.selectedIndex, 0);
  assert.equal(snapshot.looping, true);
  assert.equal(snapshot.slots[3].name, "my_sound");
  assert.equal(
    snapshot.slots[3].sound.waveform,
    "saw",
    "live edits are folded in",
  );
  assert.equal(snapshot.slots[3].empty, false);
  assert.equal(snapshot.slots[15].empty, true);
  assert.equal(snapshot.slots[0].sound.steps.length, SEQUENCE_STEP_COUNT);
});

test("a snapshot restores into a fresh bank as one undo step", () => {
  const { bank } = makeBank();
  bank.replaceSelected(createSoundSequence(), "zap"); // undo history exists
  const text = serializeBank(bank, false);
  const { bank: fresh, live: freshLive } = makeBank();
  const snapshot = parseBankSnapshot(text);
  // Bracketed like the whole-bank file import does: undo crosses the restore.
  fresh.beginEdit();
  fresh.restore(snapshot.slots, snapshot.selectedIndex);
  fresh.endEdit();
  assert.equal(fresh.selectedName, "zap");
  assert.equal(fresh.selectedIndex, 3);
  assert.equal(freshLive.waveform, fresh.slots[3].sound.waveform);
  assert.equal(fresh.canUndo, true, "undo crosses a whole-bank restore");
  assert.equal(fresh.undo(), true);
  assert.equal(fresh.selectedName, "laser", "the pre-restore bank is back");
  assert.equal(fresh.redo(), true);
  assert.equal(fresh.selectedName, "zap");
});

test("restore clamps a selection pointing at an empty or missing slot", () => {
  const { bank } = makeBank();
  const text = serializeBank(bank, false);
  const snapshot = parseBankSnapshot(text);
  bank.restore(snapshot.slots, 9); // slot 10 is empty
  assert.equal(bank.selectedIndex, 0, "falls back to the first filled slot");
  bank.restore(snapshot.slots, 99);
  assert.equal(bank.selectedIndex, 0);
});

test("invalid snapshots are rejected with clear errors, never guessed at", () => {
  assert.throws(() => parseBankSnapshot("not json"), /not valid JSON/);
  assert.throws(
    () => parseBankSnapshot('{"format":"other"}'),
    /not a Beast2D sound bank/,
  );
  assert.throws(
    () =>
      parseBankSnapshot(
        JSON.stringify({ format: BANK_STORAGE_FORMAT, version: 99 }),
      ),
    /version 99/,
  );
  assert.throws(
    () =>
      parseBankSnapshot(
        JSON.stringify({
          format: BANK_STORAGE_FORMAT,
          version: BANK_STORAGE_VERSION,
          slots: [],
        }),
      ),
    /no slots/,
  );
  const badSound = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    slots: [{ name: "x", empty: false, sound: { steps: [] } }],
  };
  assert.throws(() => parseBankSnapshot(JSON.stringify(badSound)), /steps/);
  const nameless = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    slots: [{ empty: false, sound: {} }],
  };
  assert.throws(() => parseBankSnapshot(JSON.stringify(nameless)), /no name/);
});

test("serialized sounds share the import format, so exports and snapshots agree", () => {
  const { bank } = makeBank();
  const snapshot = parseBankSnapshot(serializeBank(bank, false));
  // Fractional legacy notes survive a snapshot exactly, as they do an export.
  snapshot.slots[0].sound.steps[0].note = 60.5;
  const text = JSON.stringify({
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    selectedIndex: 0,
    looping: false,
    slots: snapshot.slots.map((slot) => ({
      name: slot.name,
      empty: slot.empty,
      sound: {
        rate: slot.sound.rate,
        waveform: slot.sound.waveform,
        masterVolume: slot.sound.masterVolume,
        pan: slot.sound.pan,
        decay: slot.sound.decay,
        pitch: slot.sound.pitch,
        cut: slot.sound.cut,
        steps: slot.sound.steps.map((step) => ({
          note: step.note,
          volume: step.volume,
          enabled: step.enabled,
        })),
      },
    })),
  });
  assert.equal(parseBankSnapshot(text).slots[0].sound.steps[0].note, 60.5);
});

test("a bank grown past sixteen slots round-trips whole through a snapshot", () => {
  const { bank } = makeBank();
  for (let i = 0; i < 12; i++) bank.addSlot(); // 20 slots, no cap
  bank.select(17);
  const text = serializeBank(bank, false);
  const snapshot = parseBankSnapshot(text);
  assert.equal(snapshot.slots.length, 20);
  assert.equal(snapshot.selectedIndex, 17);
  assert.equal(snapshot.slots[17].name, "sound_18");
  assert.equal(snapshot.slots[19].empty, false);
  const { bank: fresh } = makeBank();
  fresh.restore(snapshot.slots, snapshot.selectedIndex);
  assert.equal(fresh.slots.length, 20);
  assert.equal(fresh.selectedIndex, 17);
  assert.equal(fresh.selectedName, "sound_18");
});

test("a snapshot saved before the add-slot feature still parses and restores", () => {
  // Shape written by the persistence commit: 16 slots, no scroll state.
  const legacy = {
    format: BANK_STORAGE_FORMAT,
    version: BANK_STORAGE_VERSION,
    selectedIndex: 3,
    looping: false,
    slots: makeBank()
      .bank.copySlots()
      .map((slot) => ({
        name: slot.name,
        empty: slot.empty,
        sound: slot.sound,
      })),
  };
  const snapshot = parseBankSnapshot(JSON.stringify(legacy));
  assert.equal(snapshot.slots.length, 16);
  const { bank } = makeBank();
  bank.restore(snapshot.slots, snapshot.selectedIndex);
  assert.equal(bank.slots.length, 16);
  assert.equal(bank.scrollOffset, 0);
});
