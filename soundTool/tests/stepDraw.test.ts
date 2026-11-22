import { test } from "vitest";
import assert from "node:assert/strict";
import {
  createSoundSequence,
  NOTE_RANGE,
  paintStepNote,
  paintStepVolume,
} from "../src/shared/audio/model.js";
import { buildPreset, PRESETS } from "../src/shared/presets.js";

test("painting a note into a preset's rest enables it, so the edit sounds", () => {
  const sequence = buildPreset(PRESETS.coin);
  const step = sequence.steps[10]; // Coin sounds only steps 0 and 1.
  assert.equal(step.enabled, false);
  assert.equal(paintStepNote(step, 76), true);
  assert.equal(step.enabled, true);
  assert.equal(step.note, 76);
});

test("repainting the same note on a sounding step is a no-op", () => {
  const sequence = buildPreset(PRESETS.coin);
  const step = sequence.steps[0];
  assert.equal(paintStepNote(step, step.note), false);
});

test("painting a fresh note onto the same pitch as a rest still enables it", () => {
  const sequence = buildPreset(PRESETS.coin);
  const step = sequence.steps[10];
  assert.equal(paintStepNote(step, step.note), true);
  assert.equal(step.enabled, true);
});

test("painted notes clamp and round into the MIDI range", () => {
  const sequence = createSoundSequence();
  const step = sequence.steps[0];
  paintStepNote(step, 200.6);
  assert.equal(step.note, NOTE_RANGE.max);
  paintStepNote(step, -4);
  assert.equal(step.note, NOTE_RANGE.min);
});

test("painting a level into a preset's rest enables it", () => {
  const sequence = buildPreset(PRESETS.burst);
  const step = sequence.steps[12];
  step.volume = 3;
  assert.equal(step.enabled, false);
  assert.equal(paintStepVolume(step, 6), true);
  assert.equal(step.enabled, true);
  assert.equal(step.volume, 6);
});

test("repainting the same level on a sounding step is a no-op", () => {
  const sequence = createSoundSequence();
  const step = sequence.steps[0];
  assert.equal(paintStepVolume(step, step.volume), false);
});

test("repainting the current level on a rest still enables it", () => {
  const sequence = buildPreset(PRESETS.coin);
  const step = sequence.steps[10];
  assert.equal(paintStepVolume(step, step.volume), true);
  assert.equal(step.enabled, true);
});
