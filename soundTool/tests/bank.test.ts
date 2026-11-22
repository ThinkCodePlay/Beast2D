import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BANK_SLOTS, SoundBank } from '../src/shared/bank.js';

test('starts on the given slot and reports its name', () => {
  const bank = new SoundBank();
  assert.equal(bank.selectedIndex, 3);
  assert.equal(bank.selectedName, 'laser');
});

test('select moves to a filled slot and notifies listeners', () => {
  const bank = new SoundBank();
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));
  assert.equal(bank.select(0), true);
  assert.equal(bank.selectedIndex, 0);
  assert.deepEqual(seen, [0]);
});

test('selecting the current slot again is a no-op', () => {
  const bank = new SoundBank();
  const seen: number[] = [];
  bank.onChange(index => seen.push(index));
  assert.equal(bank.select(3), false);
  assert.deepEqual(seen, []);
});

test('empty and out-of-range slots cannot be selected', () => {
  const bank = new SoundBank();
  assert.equal(bank.select(8), false); // first empty slot
  assert.equal(bank.select(15), false);
  assert.equal(bank.select(-1), false);
  assert.equal(bank.selectedIndex, 3);
});

test('selectNext moves one filled slot per step and stops at the edges', () => {
  const bank = new SoundBank();
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
  const bank = new SoundBank(slots, 0);
  assert.equal(bank.selectNext(1), true);
  assert.equal(bank.selectedName, 'b');
});

test('unsubscribe stops notifications', () => {
  const bank = new SoundBank();
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
