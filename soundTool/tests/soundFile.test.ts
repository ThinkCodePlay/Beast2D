import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSoundSequence, SEQUENCE_STEP_COUNT } from '../src/shared/audio/model.js';
import { parseSoundFile, serializeSound, soundFileName, SOUND_FILE_VERSION } from '../src/shared/soundFile.js';

test('a sound survives a serialize/parse round trip exactly', () => {
  const sound = createSoundSequence();
  sound.rate = 2;
  sound.waveform = 'square';
  sound.masterVolume = 0.8;
  sound.pan = 0.25;
  sound.decay = 0.5;
  sound.pitch = -7;
  sound.cut = 0.3;
  sound.steps[0] = { note: 64, volume: 5, enabled: true };
  sound.steps[1] = { note: 67, volume: 3, enabled: false };
  sound.steps[31] = { note: 72, volume: 0, enabled: true };

  const { name, sound: parsed } = parseSoundFile(serializeSound('mega_zap', sound));
  assert.equal(name, 'mega_zap');
  assert.deepEqual(parsed, sound);
});

test('parse rejects text that is not JSON', () => {
  assert.throws(() => parseSoundFile('not json at all'), /not valid JSON/);
});

test('parse rejects JSON that is not a sound file', () => {
  assert.throws(() => parseSoundFile('{"hello":"world"}'), /not a Beast2D sound file/);
});

test('parse rejects an unsupported format version', () => {
  const text = serializeSound('laser', createSoundSequence()).replace(
    `"version": ${SOUND_FILE_VERSION}`,
    `"version": ${SOUND_FILE_VERSION + 1}`,
  );
  assert.throws(() => parseSoundFile(text), /Unsupported sound file version/);
});

test('fractional notes round-trip exactly, as the grid paints them', () => {
  const sound = createSoundSequence();
  sound.steps[0].note = 81.55163727959697;
  const { sound: parsed } = parseSoundFile(serializeSound('curve', sound));
  assert.equal(parsed.steps[0].note, 81.55163727959697);
});

test('parse rejects a wrong step count and bad notes', () => {
  const data = JSON.parse(serializeSound('laser', createSoundSequence()));
  data.sound.steps = data.sound.steps.slice(0, SEQUENCE_STEP_COUNT - 1);
  assert.throws(() => parseSoundFile(JSON.stringify(data)), /exactly 32 steps/);

  const bad = JSON.parse(serializeSound('laser', createSoundSequence()));
  bad.sound.steps[4].note = 200;
  assert.throws(() => parseSoundFile(JSON.stringify(bad)), /Step 5 has an invalid note/);
});

test('parse rejects an unknown waveform', () => {
  const data = JSON.parse(serializeSound('laser', createSoundSequence()));
  data.sound.waveform = 'wub';
  assert.throws(() => parseSoundFile(JSON.stringify(data)), /Unknown waveform/);
});

test('parse clamps forgiving values and defaults a bad rate', () => {
  const data = JSON.parse(serializeSound('laser', createSoundSequence()));
  data.sound.rate = 3; // not one of the five playback rates
  data.sound.masterVolume = 9;
  data.sound.pan = -2;
  data.sound.pitch = 999;
  data.sound.steps[0].volume = 12;
  const { sound } = parseSoundFile(JSON.stringify(data));
  assert.equal(sound.rate, 1);
  assert.equal(sound.masterVolume, 1);
  assert.equal(sound.pan, 0);
  assert.equal(sound.pitch, 48);
  assert.equal(sound.steps[0].volume, 7);
});

test('a missing or blank name parses as an empty string', () => {
  const data = JSON.parse(serializeSound('laser', createSoundSequence()));
  delete data.name;
  assert.equal(parseSoundFile(JSON.stringify(data)).name, '');
  data.name = '   ';
  assert.equal(parseSoundFile(JSON.stringify(data)).name, '');
});

test('download filenames are lowercase ASCII with a .json extension', () => {
  assert.equal(soundFileName('mega_zap'), 'mega_zap.json');
  assert.equal(soundFileName('Boom Big!'), 'boom_big.json');
  assert.equal(soundFileName('   '), 'sound.json');
});
