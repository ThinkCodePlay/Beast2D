import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SoundPlayer } from '../src/audio/SoundPlayer.js';
import { createSoundSequence, WAVEFORM_TYPES } from '../src/audio/model.js';
import { normalizedVolume, noteFrequency, STEP_SECONDS } from '../src/audio/synthesis.js';

class Param {
  value = 0;
  points: [number, number][] = [];
  setValueAtTime(value: number, time: number): this { this.value = value; this.points.push([value, time]); return this; }
  linearRampToValueAtTime(value: number, time: number): this { return this.setValueAtTime(value, time); }
  cancelScheduledValues(): void {}
}
class Node extends EventTarget {
  gain = new Param();
  frequency = new Param();
  type = '';
  buffer: unknown;
  loop = false;
  wave: unknown;
  startTime = 0;
  stops: number[] = [];
  disconnected = false;
  connect(node: Node): Node { return node; }
  disconnect(): void { this.disconnected = true; }
  start(time: number): void { this.startTime = time; }
  stop(time: number): void { this.stops.push(time); }
  setPeriodicWave(wave: unknown): void { this.wave = wave; }
  end(): void { this.dispatchEvent(new Event('ended')); }
}
class Context {
  state = 'running';
  currentTime = 10;
  destination = new Node();
  voices: Node[] = [];
  outputs: Node[] = [];
  resume = async (): Promise<void> => { this.state = 'running'; };
  createGain(): Node { const node = new Node(); this.outputs.push(node); return node; }
  createOscillator(): Node { const node = new Node(); this.voices.push(node); return node; }
  sampleRate = 8000;
  createBufferSource(): Node { const node = new Node(); this.voices.push(node); return node; }
  createBuffer(_channels: number, length: number): { length: number; getChannelData(): Float32Array } {
    const data = new Float32Array(length);
    return { length, getChannelData: () => data };
  }
  createPeriodicWave(real: Float32Array, imag: Float32Array): { real: Float32Array; imag: Float32Array } { return { real, imag }; }
  async close(): Promise<void> { this.state = 'closed'; }
}
function setup(context = new Context()): { context: Context; player: SoundPlayer } {
  return { context, player: new SoundPlayer(() => context as unknown as AudioContext) };
}

test('notes and normalized master gain are bounded', () => {
  assert.equal(noteFrequency(69), 440);
  assert.equal(noteFrequency(81), 880);
  assert.equal(noteFrequency(NaN), noteFrequency(60));
  assert.equal(noteFrequency(-5), noteFrequency(0));
  assert.equal(normalizedVolume(NaN), 0);
  assert.equal(normalizedVolume(7), 1);
  assert.equal(createSoundSequence().masterVolume, 0.25);
});
test('32-step snapshot uses audio-clock slots, keeping silent slot timing', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.steps[1].enabled = false;
  sequence.steps[2].volume = 0;
  await player.play(sequence);
  assert.equal(context.voices.length, 30);
  assert.equal(context.voices[1].startTime, 10.01 + 3 * STEP_SECONDS);
  assert.ok(Math.abs(context.voices[29].stops[0] - (10.01 + 32 * STEP_SECONDS)) < 1e-10);
  sequence.steps[0].note = 100;
  assert.equal(context.voices[0].frequency.points[0][0], noteFrequency(60));
  assert.equal(context.outputs[0].gain.value, 0.25);
});
test('Stop cancels active and future voices, then releases every node', async () => {
  const { context, player } = setup();
  await player.play(createSoundSequence());
  player.stop();
  assert.ok(context.voices.every(voice => voice.stops.at(-1) === 10.008));
  context.voices.forEach(voice => voice.end());
  assert.ok(context.outputs.every(output => output.disconnected));
  assert.ok(context.voices.every(voice => voice.disconnected));
});
test('a new Play cancels the previous run; natural end cleans output', async () => {
  const { context, player } = setup();
  await player.play(createSoundSequence());
  const first = [...context.voices];
  await player.play(createSoundSequence());
  assert.ok(first.every(voice => voice.stops.length === 2));
  context.voices.forEach(voice => voice.end());
  assert.ok(context.outputs.every(output => output.disconnected));
});
test('Stop during pending resume cannot start late playback', async () => {
  const { context, player } = setup();
  context.state = 'suspended';
  let resolve!: () => void;
  context.resume = () => new Promise<void>(r => { resolve = r; });
  const pending = player.play(createSoundSequence());
  player.stop();
  context.state = 'running'; resolve(); await pending;
  assert.equal(context.voices.length, 0);
});
test('rejected startup can be retried, and dispose is final and idempotent', async () => {
  const { context, player } = setup();
  context.state = 'suspended';
  context.resume = async () => { throw new Error('permission blocked'); };
  await assert.rejects(player.play(createSoundSequence()), /permission blocked/);
  context.resume = async () => { context.state = 'running'; };
  await player.play(createSoundSequence());
  await player.dispose(); await player.dispose();
  assert.equal(context.state, 'closed');
  const count = context.voices.length;
  await player.play(createSoundSequence());
  assert.equal(context.voices.length, count);
});

test('each waveform choice builds the right voice for every step', async () => {
  const oscillatorTypes = { sine: 'sine', square: 'square', saw: 'sawtooth', triangle: 'triangle' } as const;
  for (const waveform of WAVEFORM_TYPES) {
    const { context, player } = setup();
    const sequence = createSoundSequence();
    sequence.waveform = waveform;
    await player.play(sequence);
    assert.equal(context.voices.length, 32, waveform);
    const voice = context.voices[0];
    if (waveform === 'noise') {
      assert.ok(voice.buffer && voice.loop && voice.frequency.points.length === 0);
    } else if (waveform === 'pulse') {
      assert.ok(voice.wave);
    } else {
      assert.equal(voice.type, oscillatorTypes[waveform]);
    }
  }
});
test('Play snapshots the waveform; a later change applies on the next Play', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.waveform = 'square';
  await player.play(sequence);
  sequence.waveform = 'triangle';
  assert.ok(context.voices.every(voice => voice.type === 'square'));
  await player.play(sequence);
  assert.equal(context.voices.at(-1)?.type, 'triangle');
});
test('an unknown waveform falls back to sine', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  (sequence as { waveform: string }).waveform = 'bogus';
  await player.play(sequence);
  assert.equal(context.voices[0].type, 'sine');
});
