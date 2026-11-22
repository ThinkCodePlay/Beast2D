import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BANK_SLOTS, MAX_NAME_LENGTH, SoundBank, UNDO_LIMIT } from '../src/shared/bank.js';
import { createSoundSequence } from '../src/shared/audio/model.js';

function makeBank(selectedIndex = 3): SoundBank {
  return new SoundBank(() => createSoundSequence(), selectedIndex);
}

test('starts on the given slot and reports its name', () => {
  const bank = makeBank();
  assert.equal(bank.selectedIndex, 3);
  assert.equal(bank.selectedName, 'laser');
});

test('select moves to a filled slot and notifies listeners', () => {
  const bank = makeBank();
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));
  assert.equal(bank.select(0), true);
  assert.equal(bank.selectedIndex, 0);
  assert.deepEqual(seen, [0]);
});

test('selecting the current slot again is a no-op', () => {
  const bank = makeBank();
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));
  assert.equal(bank.select(3), false);
  assert.deepEqual(seen, []);
});

test('empty and out-of-range slots cannot be selected', () => {
  const bank = makeBank();
  assert.equal(bank.select(8), false); // first empty slot
  assert.equal(bank.select(15), false);
  assert.equal(bank.select(-1), false);
  assert.equal(bank.selectedIndex, 3);
});

test('selectNext moves one filled slot per step and stops at the edges', () => {
  const bank = makeBank();
  assert.equal(bank.selectNext(1), true);
  assert.equal(bank.selectedIndex, 4);
  // Up from the last filled slot (7) has nowhere to go: slots 8+ are empty.
  bank.select(7);
  assert.equal(bank.selectNext(1), false);
  assert.equal(bank.selectedIndex, 7);
  bank.select(0);
  assert.equal(bank.selectNext(-1), false);
  assert.equal(bank.selectedIndex, 0);
});

test('selectNext skips empty slots when any lie ahead', () => {
  const slots = [
    { name: 'a', empty: false },
    { name: 'empty', empty: true },
    { name: 'b', empty: false },
  ];
  const bank = new SoundBank(() => createSoundSequence(), 0, slots);
  assert.equal(bank.selectNext(1), true);
  assert.equal(bank.selectedName, 'b');
});

test('unsubscribe stops notifications', () => {
  const bank = makeBank();
  const seen: number[] = [];
  const off = bank.onChange(index => seen.push(index));
  off();
  bank.select(1);
  assert.deepEqual(seen, []);
});

test('default bank has sixteen slots, the last eight empty', () => {
  assert.equal(DEFAULT_BANK_SLOTS.length, 16);
  assert.ok(DEFAULT_BANK_SLOTS.slice(0, 8).every(slot => !slot.empty));
  assert.ok(DEFAULT_BANK_SLOTS.slice(8).every(slot => slot.empty));
});

test('activate loads the selected slot into the live sequence', () => {
  const bank = makeBank();
  bank.slots[3].sound.waveform = 'square';
  bank.slots[3].sound.pitch = 5;
  const live = createSoundSequence();
  bank.activate(live);
  assert.equal(live.waveform, 'square');
  assert.equal(live.pitch, 5);
});

test('each slot keeps its own edits across switching', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  // Edit slot 04's sound: saw wave, pitch up, first step a high quiet note.
  live.waveform = 'saw';
  live.pitch = 7;
  live.steps[0].note = 84;
  live.steps[0].volume = 2;
  bank.select(0);
  // Slot 01 loads its own untouched sound.
  assert.equal(live.waveform, 'sine');
  assert.equal(live.pitch, 0);
  assert.equal(live.steps[0].note, 60);
  // Edit slot 01 differently, then switch back: both slots kept their edits.
  live.waveform = 'triangle';
  bank.select(3);
  assert.equal(live.waveform, 'saw');
  assert.equal(live.pitch, 7);
  assert.equal(live.steps[0].note, 84);
  assert.equal(live.steps[0].volume, 2);
  bank.select(0);
  assert.equal(live.waveform, 'triangle');
});

test('rename trims, caps at MAX_NAME_LENGTH, and notifies', () => {
  const bank = makeBank();
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));
  assert.equal(bank.rename('  mega_laser  '), true);
  assert.equal(bank.selectedName, 'mega_laser');
  assert.deepEqual(seen, [3]);
  assert.equal(bank.rename('x'.repeat(MAX_NAME_LENGTH + 10)), true);
  assert.equal(bank.selectedName.length, MAX_NAME_LENGTH);
});

test('rename rejects empty and unchanged names', () => {
  const bank = makeBank();
  assert.equal(bank.rename('   '), false);
  assert.equal(bank.rename('laser'), false);
  assert.equal(bank.selectedName, 'laser');
});

test('renaming one slot leaves the others alone', () => {
  const bank = makeBank();
  bank.rename('zap');
  bank.select(0);
  assert.equal(bank.selectedName, 'jump');
  bank.select(3);
  assert.equal(bank.selectedName, 'zap');
});

test('replaceSelected swaps the selected slot\'s sound into the live sequence', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  const incoming = createSoundSequence();
  incoming.waveform = 'noise';
  incoming.pitch = -5;
  incoming.steps[0] = { note: 40, volume: 1, enabled: false };
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));

  bank.replaceSelected(incoming, 'imported');
  assert.equal(bank.selectedName, 'imported');
  assert.equal(live.waveform, 'noise');
  assert.equal(live.pitch, -5);
  assert.deepEqual(live.steps[0], { note: 40, volume: 1, enabled: false });
  assert.deepEqual(seen, [3]);
});

test('replaceSelected keeps the imported sound in the slot across switches', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  const incoming = createSoundSequence();
  incoming.waveform = 'pulse';
  bank.replaceSelected(incoming, 'zap');
  bank.select(0); // live now holds slot 01's sound
  bank.select(3); // and back
  assert.equal(live.waveform, 'pulse');
  assert.equal(bank.selectedName, 'zap');
});

test('replaceSelected edits the stored copy, not the imported object', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  const incoming = createSoundSequence();
  bank.replaceSelected(incoming, 'zap');
  incoming.waveform = 'saw'; // later edits to the source must not leak in
  assert.equal(live.waveform, 'sine');
});

test('replaceSelected with a blank name keeps the old name', () => {
  const bank = makeBank();
  bank.replaceSelected(createSoundSequence(), '   ');
  assert.equal(bank.selectedName, 'laser');
});

test('undoLast restores the sound and name a replacement overwrote', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  // Edit the live sequence so the slot's current sound is distinctive.
  live.waveform = 'saw';
  live.decay = 0.2;
  live.steps[0].note = 66;
  bank.rename('my_sound');

  const incoming = createSoundSequence();
  incoming.waveform = 'pulse';
  bank.replaceSelected(incoming, 'zap');
  assert.equal(bank.selectedName, 'zap');
  assert.equal(bank.canUndo, true);

  assert.equal(bank.undoLast(), true);
  assert.equal(bank.selectedName, 'my_sound');
  assert.equal(live.waveform, 'saw');
  assert.equal(live.decay, 0.2);
  assert.equal(live.steps[0].note, 66);
  assert.equal(bank.canUndo, false);
});

test('undoLast restores the replaced slot even after the selection moved on', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  bank.replaceSelected(createSoundSequence(), 'zap');
  bank.select(0);

  assert.equal(bank.undoLast(), true);
  assert.equal(bank.selectedIndex, 3, 'the restored slot becomes the selection');
  assert.equal(bank.selectedName, 'laser');
});

test('undoLast restores the stored slot sound, not just the live sequence', () => {
  const bank = makeBank();
  const live = createSoundSequence();
  bank.activate(live);
  live.waveform = 'saw';
  bank.replaceSelected(createSoundSequence(), 'zap');
  assert.equal(bank.undoLast(), true);
  bank.select(0); // live now holds slot 01's sound
  bank.select(3); // and back
  assert.equal(live.waveform, 'saw');
});

test('undoLast with an empty history is a no-op', () => {
  const bank = makeBank();
  assert.equal(bank.canUndo, false);
  assert.equal(bank.undoLast(), false);
  assert.equal(bank.selectedIndex, 3);
});

test('undo history keeps only the newest UNDO_LIMIT replacements', () => {
  const bank = makeBank();
  for (let round = 0; round < UNDO_LIMIT + 2; round += 1) {
    bank.replaceSelected(createSoundSequence(), `sound_${round}`);
  }
  for (let round = 0; round < UNDO_LIMIT; round += 1) {
    assert.equal(bank.undoLast(), true, `undo ${round}`);
  }
  assert.equal(bank.undoLast(), false, 'the oldest replacements fall off');
});
