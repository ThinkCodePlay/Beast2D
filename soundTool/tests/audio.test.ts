import { PLAYBACK_RATES, rateFromDial, rateToDial, validRate } from '../src/shared/audio/rate.js';
import {
  CUTOFF_MAX_HZ,
  CUTOFF_MIN_HZ,
  cutoffFromDial,
  panFromDial,
  pitchFromDial,
  pitchToDial,
  ringShareFromDial,
  snapPanDial,
  validPitch,
} from '../src/shared/audio/effects.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SoundPlayer } from '../src/shared/audio/SoundPlayer.js';
import { createSoundSequence, WAVEFORM_TYPES } from '../src/shared/audio/model.js';
import { normalizedVolume, noteFrequency, STEP_SECONDS } from '../src/shared/audio/synthesis.js';

class Param {
  value = 0;
  points: [number, number][] = [];
  setValueAtTime(value: number, time: number): this { this.value = value; this.points.push([value, time]); return this; }
  linearRampToValueAtTime(value: number, time: number): this { return this.setValueAtTime(value, time); }
  holds: number[] = [];
  cancelAndHoldAtTime(time: number): void { this.holds.push(time); }
  cancelScheduledValues(): void {}
}
class Node extends EventTarget {
  gain = new Param();
  frequency = new Param();
  pan = new Param();
  type = '';
  buffer: unknown;
  loop = false;
  wave: unknown;
  startTime = 0;
  stops: number[] = [];
  disconnected = false;
  connections: Node[] = [];
  connect(node: Node): Node { this.connections.push(node); return node; }
  disconnect(): void { this.disconnected = true; this.connections = []; }
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
  panners: Node[] = [];
  filters: Node[] = [];
  resume = async (): Promise<void> => { this.state = 'running'; };
  createGain(): Node { const node = new Node(); this.outputs.push(node); return node; }
  createStereoPanner(): Node { const node = new Node(); this.panners.push(node); return node; }
  createBiquadFilter(): Node { const node = new Node(); this.filters.push(node); return node; }
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

test('audition uses the edited note, selected waveform and both volume levels for 100 ms', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.waveform = 'triangle';
  sequence.masterVolume = 0.4;
  sequence.steps[3].note = 81;
  sequence.steps[3].volume = 3;
  await player.audition(sequence, 3);
  assert.equal(context.voices.length, 1);
  assert.equal(context.voices[0].frequency.value, 880);
  assert.equal(context.voices[0].type, 'triangle');
  assert.equal(context.voices[0].stops[0], 10.1);
  assert.equal(context.outputs[0].gain.value, 0.4);
  assert.ok(context.outputs[1].gain.points.some(([value]) => value === 3 / 7));
  context.voices[0].end();
  assert.ok(context.outputs.every(output => output.disconnected));
});
test('a volume edit re-previews at the new level, and zero silences the preview', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  await player.audition(sequence, 0);
  context.currentTime = 10.1;
  sequence.steps[0].volume = 2;
  await player.audition(sequence, 0);
  assert.equal(context.voices.length, 2);
  assert.ok(context.outputs.some(output => output.gain.points.some(([value]) => value === 2 / 7)));
  assert.ok(Math.abs((context.voices[0].stops.at(-1) ?? 0) - 10.108) < 1e-10);
  context.currentTime = 10.2;
  sequence.steps[0].volume = 0;
  await player.audition(sequence, 0);
  assert.equal(context.voices.length, 2);
  assert.ok(Math.abs((context.voices[1].stops.at(-1) ?? 0) - 10.208) < 1e-10);
  player.stop();
});
test('audition is bounded during floods and retains the final edit', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  await player.audition(sequence, 0);
  for (let i = 0; i < 200; i++) {
    sequence.steps[0].note = 60 + i % 24;
    await player.audition(sequence, 0);
  }
  assert.equal(context.voices.length, 1);
  await new Promise(resolve => setTimeout(resolve, 70));
  assert.equal(context.voices.length, 2);
  assert.equal(context.voices[1].frequency.value, noteFrequency(sequence.steps[0].note));
  assert.equal(context.voices[0].stops.at(-1), 10.008);
  player.stop();
});
test('muted/disabled steps and master mute cancel previews without making a voice', async () => {
  for (const mute of ['step', 'enabled', 'master']) {
    const { context, player } = setup();
    const sequence = createSoundSequence();
    await player.audition(sequence, 0);
    if (mute === 'step') sequence.steps[0].volume = 0;
    if (mute === 'enabled') sequence.steps[0].enabled = false;
    if (mute === 'master') sequence.masterVolume = 0;
    await player.audition(sequence, 0);
    assert.equal(context.voices.length, 1);
    assert.equal(context.voices[0].stops.at(-1), 10.008);
    player.stop();
  }
});
test('Stop and Play cancel trailing previews, and editing cannot interrupt a sequence snapshot', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  await player.audition(sequence, 0);
  await player.audition(sequence, 1);
  player.stop();
  await new Promise(resolve => setTimeout(resolve, 70));
  assert.equal(context.voices.length, 1);
  await player.audition(sequence, 2);
  await player.audition(sequence, 3);
  await player.play(sequence);
  const count = context.voices.length;
  sequence.steps[0].note = 81;
  await player.audition(sequence, 0);
  await new Promise(resolve => setTimeout(resolve, 70));
  assert.equal(context.voices.length, count);
  assert.equal(context.voices[2].frequency.value, noteFrequency(60));
  player.stop();
});
test('pending resume obeys Stop, newer edits, pending Play and disposal', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  context.state = 'suspended';
  const resolves: (() => void)[] = [];
  context.resume = () => new Promise<void>(resolve => resolves.push(resolve));
  const first = player.audition(sequence, 0);
  sequence.steps[1].note = 81;
  const second = player.audition(sequence, 1);
  context.state = 'running'; resolves.forEach(resolve => resolve());
  await Promise.all([first, second]);
  assert.equal(context.voices.length, 1);
  assert.equal(context.voices[0].frequency.value, 880);
  player.stop();
  context.state = 'suspended';
  const play = player.play(sequence);
  await player.audition(sequence, 0);
  assert.equal(resolves.length, 3);
  player.stop();
  context.state = 'running'; resolves[2](); await play;
  assert.equal(context.voices.length, 1);
  context.state = 'suspended';
  const preview = player.audition(sequence, 0);
  await player.dispose();
  resolves[3](); await preview;
  assert.equal(context.voices.length, 1);
});

test('five rate positions are octave-spaced with 1x centered, valid endpoints and fallback', () => {
  assert.deepEqual(PLAYBACK_RATES.map(rateToDial), [0, .25, .5, .75, 1]);
  assert.deepEqual([0,.25,.5,.75,1].map(rateFromDial), PLAYBACK_RATES);
  assert.equal(rateFromDial(.6), 1);
  assert.equal(validRate(NaN), 1);
  assert.equal(validRate(0), 1);
  assert.equal(createSoundSequence().rate, 1);
});
test('all rates scale duration and slots, never frequency; changes wait for Play', async () => {
  for (const rate of PLAYBACK_RATES) {
    const {context, player} = setup();
    const sequence = createSoundSequence(); sequence.rate = rate;
    await player.play(sequence);
    assert.ok(Math.abs(context.voices.at(-1)!.stops[0] - (10.01 + 32 * STEP_SECONDS / rate)) < 1e-10);
    assert.equal(context.voices[1].startTime, 10.01 + STEP_SECONDS / rate);
    assert.equal(context.voices[0].frequency.value, noteFrequency(60));
    sequence.rate = 4;
    assert.ok(Math.abs(context.voices[0].stops[0] - (10.01 + STEP_SECONDS / rate)) < 1e-10);
    player.stop();
    assert.ok(context.voices.every(voice => voice.stops.at(-1) === 10.008));
  }
});
test('live master ramps playback and audition, does not edit step levels or create context', async () => {
  for (const mode of ['play', 'audition'] as const) {
    const {context, player} = setup(); const sequence = createSoundSequence();
    const steps = structuredClone(sequence.steps);
    if (mode === 'play') await player.play(sequence); else await player.audition(sequence, 0);
    const output = context.outputs[0]; const count = context.voices.length;
    player.setMasterVolume(.8);
    assert.deepEqual(output.gain.points.at(-1), [.8,10.008]);
    assert.deepEqual(output.gain.holds, [10]);
    player.setMasterVolume(0);
    assert.deepEqual(output.gain.points.at(-1), [0,10.008]);
    assert.equal(context.voices.length, count);
    assert.deepEqual(sequence.steps, steps);
    player.stop(); player.setMasterVolume(1);
    assert.deepEqual(output.gain.points.at(-1), [0,10.008]);
  }
  let creates = 0; const player = new SoundPlayer(() => { creates++; throw new Error(); });
  player.setMasterVolume(1); assert.equal(creates, 0);
});
test('pending Play and trailing audition use the latest live master value', async () => {
  const {context, player} = setup(); const sequence = createSoundSequence();
  context.state = 'suspended'; let resume!: () => void;
  context.resume = () => new Promise<void>(r => { resume = r; });
  const pending = player.play(sequence); player.setMasterVolume(.6);
  context.state = 'running'; resume(); await pending;
  assert.equal(context.outputs[0].gain.value, .6);
  player.stop(); await player.audition(sequence, 0); await player.audition(sequence, 0);
  player.setMasterVolume(.9);
  await new Promise(r => setTimeout(r, 70));
  // Last output before the envelope is the coalesced preview's master.
  assert.equal(context.outputs.at(-2)!.gain.value, .9);
  player.stop();
});

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

test('loop repeats the snapshot on exact audio-clock boundaries at every rate', async () => {
  for (const rate of PLAYBACK_RATES) {
    const { context, player } = setup();
    const sequence = createSoundSequence();
    sequence.rate = rate;
    player.setLoopEnabled(true);
    await player.play(sequence);
    const pass = 32 * STEP_SECONDS / rate;
    assert.equal(context.voices.length, 32, String(rate));
    context.currentTime = 10.01 + pass - 0.2;
    await wait(150);
    assert.equal(context.voices.length, 64, String(rate));
    assert.ok(Math.abs(context.voices[32].startTime - (10.01 + pass)) < 1e-10);
    assert.ok(Math.abs(context.voices[63].stops[0] - (10.01 + 2 * pass)) < 1e-10);
    context.currentTime = 10.01 + 2 * pass - 0.2;
    await wait(150);
    assert.equal(context.voices.length, 96, String(rate));
    // Ended passes disconnect their nodes; a long loop stays bounded.
    context.voices.slice(0, 32).forEach(voice => voice.end());
    assert.ok(context.voices.slice(0, 32).every(voice => voice.disconnected));
    assert.ok(!context.outputs[0].disconnected);
    player.stop();
  }
});
test('a looped pass keeps the Play snapshot and follows the live master gain', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  player.setLoopEnabled(true);
  await player.play(sequence);
  sequence.steps[0].note = 81;
  sequence.rate = 4;
  player.setMasterVolume(0.8);
  assert.deepEqual(context.outputs[0].gain.points.at(-1), [0.8, 10.008]);
  context.currentTime = 10.01 + 32 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices[32].frequency.value, noteFrequency(60));
  assert.ok(Math.abs(context.voices[32].startTime - (10.01 + 32 * STEP_SECONDS)) < 1e-10);
  player.stop();
});
test('turning loop off during play finishes the current pass, then releases', async () => {
  const { context, player } = setup();
  player.setLoopEnabled(true);
  await player.play(createSoundSequence());
  player.setLoopEnabled(false);
  context.currentTime = 10.01 + 32 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 32);
  context.currentTime = 10.01 + 32 * STEP_SECONDS;
  context.voices.forEach(voice => voice.end());
  assert.ok(context.outputs.every(output => output.disconnected));
});
test('turning loop on during a one-shot play repeats from the next boundary, armed once', async () => {
  const { context, player } = setup();
  await player.play(createSoundSequence());
  player.setLoopEnabled(true);
  player.setLoopEnabled(false);
  player.setLoopEnabled(true);
  context.currentTime = 10.01 + 32 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 64);
  context.currentTime = 10.01 + 64 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 96);
  player.stop();
});
test('a one-shot play ignores the loop latch and leaves it untouched', async () => {
  const { context, player } = setup();
  const pass = 32 * STEP_SECONDS;
  player.setLoopEnabled(true);
  await player.play(createSoundSequence(), { once: true });
  assert.equal(context.voices.length, 32);
  // Toggling the latch mid-flight must not arm the one-shot either.
  player.setLoopEnabled(false);
  player.setLoopEnabled(true);
  context.currentTime = 10.01 + pass - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 32, 'no repeat is scheduled');
  // The latch itself is untouched: the next regular Play loops again.
  await player.play(createSoundSequence());
  assert.equal(context.voices.length, 64);
  context.currentTime = 10.02 + 2 * pass - 0.4;
  await wait(150);
  assert.equal(context.voices.length, 96, 'a regular Play still loops');
  player.stop();
});

test('Stop during a loop cancels the pending pass; a restart keeps a single chain', async () => {
  const { context, player } = setup();
  player.setLoopEnabled(true);
  await player.play(createSoundSequence());
  context.currentTime = 10.01 + 32 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 64);
  player.stop();
  context.currentTime = 20;
  await wait(150);
  assert.equal(context.voices.length, 64);
  await player.play(createSoundSequence());
  assert.equal(context.voices.length, 96);
  context.currentTime = 20.01 + 32 * STEP_SECONDS - 0.2;
  await wait(150);
  assert.equal(context.voices.length, 128);
  player.stop();
});
test('loop armed during a pending resume still obeys Stop', async () => {
  const { context, player } = setup();
  context.state = 'suspended';
  let resume!: () => void;
  context.resume = () => new Promise<void>(r => { resume = r; });
  player.setLoopEnabled(true);
  const pending = player.play(createSoundSequence());
  player.stop();
  context.state = 'running'; resume(); await pending;
  assert.equal(context.voices.length, 0);
  context.currentTime = 100;
  await wait(150);
  assert.equal(context.voices.length, 0);
  player.setLoopEnabled(false);
});

test('fresh sequence rests every dial at its neutral position', () => {
  const sequence = createSoundSequence();
  assert.equal(sequence.pan, 0.5);
  assert.equal(sequence.decay, 1);
  assert.equal(sequence.pitch, 0);
  assert.equal(sequence.cut, 1);
});

test('dial mappings hit their neutral and extreme points exactly', () => {
  assert.equal(snapPanDial(0.5), 0.5);
  assert.equal(panFromDial(0), -1);
  assert.equal(panFromDial(0.5), 0);
  assert.equal(panFromDial(1), 1);
  assert.equal(pitchFromDial(0.5), 0);
  assert.equal(pitchFromDial(1), 12);
  assert.equal(pitchFromDial(0), -12);
  assert.equal(pitchToDial(0), 0.5);
  assert.equal(pitchToDial(7), pitchToDial(pitchFromDial(pitchToDial(7))));
  assert.equal(validPitch(NaN), 0);
  assert.equal(validPitch(99), 12);
  assert.equal(cutoffFromDial(1), CUTOFF_MAX_HZ);
  assert.equal(cutoffFromDial(0), CUTOFF_MIN_HZ);
  assert.equal(ringShareFromDial(1), 1);
  assert.equal(ringShareFromDial(0.5), 0.53);
});

test('fully open CUT bypasses the filter; below maximum the chain runs gain into filter into panner', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.pan = 1;
  await player.play(sequence);
  assert.equal(context.panners.length, 1);
  assert.equal(context.panners[0].pan.value, 1);
  assert.equal(context.outputs[0].connections.length, 1);
  assert.equal(context.outputs[0].connections[0], context.panners[0]);
  assert.equal(context.filters[0].connections.length, 0);
  player.stop();
  sequence.cut = 0.5;
  const channelIndex = context.outputs.length; // The channel gain is created first.
  await player.play(sequence);
  assert.equal(context.filters[1].type, 'lowpass');
  assert.equal(context.filters[1].frequency.value, cutoffFromDial(0.5));
  assert.equal(context.outputs[channelIndex].connections[0], context.filters[1]);
  assert.equal(context.filters[1].connections[0], context.panners[1]);
});

test('CUT crossing the fully open point rewires the filter live', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  await player.play(sequence);
  player.setCutoff(0.5);
  assert.equal(context.outputs[0].connections[0], context.filters[0]);
  assert.equal(context.filters[0].connections[0], context.panners[0]);
  player.setCutoff(1);
  assert.equal(context.outputs[0].connections[0], context.panners[0]);
  assert.equal(context.filters[0].connections.length, 0);
});

test('PAN and CUT turn live during playback and previews; alone they create no audio', async () => {
  const { context, player } = setup();
  player.setPan(0);
  player.setCutoff(0);
  assert.equal(context.panners.length, 0);
  const sequence = createSoundSequence();
  sequence.pan = 0;
  sequence.cut = 0.5;
  await player.play(sequence);
  assert.equal(context.panners[0].pan.value, -1);
  assert.equal(context.filters[0].frequency.value, cutoffFromDial(0.5));
  player.setPan(1);
  assert.equal(context.panners[0].pan.points.at(-1)?.[0], 1);
  player.setCutoff(0.8);
  assert.equal(context.filters[0].frequency.points.at(-1)?.[0], cutoffFromDial(0.8));
  context.voices.forEach(voice => voice.end()); // End the pass so a preview can start.
  sequence.pan = 1;
  await player.audition(sequence, 0);
  assert.equal(context.panners[1].pan.value, 1);
});

test('DECAY shortens the ring without touching step volumes; full decay is unchanged', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.decay = 0.5;
  await player.play(sequence);
  const envelope = context.outputs[1].gain;
  const ring = STEP_SECONDS * 0.53;
  assert.ok(envelope.points.some(([value, time]) => value === 0 && Math.abs(time - (10.01 + ring)) < 1e-10));
  assert.ok(!envelope.points.some(([value, time]) => value === 1 && time > 10.01 + ring));
});

test('full DECAY keeps the legacy hold-and-release envelope', async () => {
  const { context, player } = setup();
  await player.play(createSoundSequence());
  const envelope = context.outputs[1].gain;
  assert.ok(envelope.points.some(([value, time]) => value === 1 && Math.abs(time - (10.01 + STEP_SECONDS - 0.003)) < 1e-10));
});

test('PITCH shifts playback and preview pitch without editing the drawn notes', async () => {
  const { context, player } = setup();
  const sequence = createSoundSequence();
  sequence.pitch = 12;
  await player.play(sequence);
  assert.equal(context.voices[0].frequency.value, noteFrequency(72));
  assert.equal(sequence.steps[0].note, 60);
  context.voices.forEach(voice => voice.end()); // End the pass so a preview can start.
  sequence.pitch = -12;
  await player.audition(sequence, 0);
  assert.equal(context.voices.at(-1)?.frequency.value, noteFrequency(48));
});
