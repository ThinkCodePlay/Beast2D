import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPreset,
  buildPreset,
  isPresetKey,
  PRESET_KEYS,
  PRESETS,
} from "../src/shared/presets.js";
import { MAX_NAME_LENGTH, SoundBank } from "../src/shared/bank.js";
import {
  createSoundSequence,
  NOTE_RANGE,
  SEQUENCE_STEP_COUNT,
  type SoundSequence,
} from "../src/shared/audio/model.js";
import { parseSoundFile, serializeSound } from "../src/shared/soundFile.js";

function sequenceValues(sound: SoundSequence): unknown {
  return {
    rate: sound.rate,
    waveform: sound.waveform,
    masterVolume: sound.masterVolume,
    pan: sound.pan,
    decay: sound.decay,
    pitch: sound.pitch,
    cut: sound.cut,
    steps: sound.steps.map((step) => ({ ...step })),
  };
}

test("every pad icon maps to a preset and back", () => {
  for (const key of PRESET_KEYS) assert.ok(isPresetKey(key), key);
  assert.ok(!isPresetKey("heart"));
  assert.ok(!isPresetKey("gem"));
});

test("preset names are unique and fit the LCD", () => {
  const names = PRESET_KEYS.map((key) => PRESETS[key].name);
  assert.equal(new Set(names).size, PRESET_KEYS.length);
  for (const name of names) {
    assert.ok(name.length > 0);
    assert.ok(name.length <= MAX_NAME_LENGTH, name);
  }
});

test("every preset builds a valid, playable sequence", () => {
  for (const key of PRESET_KEYS) {
    const sound = buildPreset(PRESETS[key]);
    assert.equal(sound.steps.length, SEQUENCE_STEP_COUNT, key);
    assert.ok(
      sound.steps.some((step) => step.enabled),
      `${key} plays at least one note`,
    );
    for (const step of sound.steps) {
      assert.ok(
        Number.isInteger(step.note),
        `${key} note ${step.note} is a whole semitone`,
      );
      assert.ok(
        step.note >= NOTE_RANGE.min && step.note <= NOTE_RANGE.max,
        key,
      );
      assert.ok(
        Number.isInteger(step.volume) && step.volume >= 0 && step.volume <= 7,
        key,
      );
    }
  }
});

test("presets survive an export/import round trip unchanged", () => {
  for (const key of PRESET_KEYS) {
    const spec = PRESETS[key];
    const parsed = parseSoundFile(serializeSound(spec.name, buildPreset(spec)));
    assert.equal(parsed.name, spec.name, key);
    assert.deepEqual(
      sequenceValues(parsed.sound),
      sequenceValues(buildPreset(spec)),
      key,
    );
  }
});

test("applyPreset replaces the selected slot and Undo restores it exactly", () => {
  const bank = new SoundBank(() => createSoundSequence(), 3);
  const sequence = createSoundSequence();
  bank.activate(sequence);
  // Give the slot a distinctive sound, as if the user had edited it.
  sequence.waveform = "saw";
  sequence.decay = 0.2;
  sequence.steps[0].note = 66;
  bank.rename("my_sound");
  const before = sequenceValues(sequence);

  applyPreset(bank, "coin");
  assert.equal(bank.selectedName, "coin");
  assert.equal(sequence.waveform, "pulse");
  assert.deepEqual(
    sequenceValues(sequence),
    sequenceValues(buildPreset(PRESETS.coin)),
  );

  assert.equal(bank.undoLast(), true);
  assert.equal(bank.selectedName, "my_sound");
  assert.deepEqual(sequenceValues(sequence), before);
  assert.equal(bank.canUndo, false);
});
