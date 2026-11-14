import {
  CHIPS,
  SFX_SLOTS,
  SFX_STEPS,
  applyChip,
  lerpRange,
  type AppliedSfx,
  type ChipSpec,
  type WaveId,
} from "./chips";
import { knobTo01, pitchTo01, volumeTo01 } from "./grid";
import { getSfxBank } from "./bank";

type PlayListener = (slot: number) => void;
type AppliedListener = (applied: AppliedSfx) => void;

type Transport = {
  slot: number;
  started: number;
  stepDur: number;
  loop: boolean;
  clock: AudioContext | null;
};

const playListeners = new Set<PlayListener>();
const appliedListeners = new Set<AppliedListener>();
let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;
const pulseWaves = new Map<number, PeriodicWave>();
let waveTable: PeriodicWave | null = null;
let nodes: AudioScheduledSourceNode[] = [];
let playToken = 0;
let transport: Transport | null = null;

export function onSfxPlayed(listener: PlayListener): () => void {
  playListeners.add(listener);
  return () => playListeners.delete(listener);
}

/** Test seam: last `AppliedSfx` passed to the synth for a slot. */
export function onSfxApplied(listener: AppliedListener): () => void {
  appliedListeners.add(listener);
  return () => appliedListeners.delete(listener);
}

export function sfxPlayhead(): { slot: number; step: number } | null {
  if (!transport) return null;
  const now = transport.clock ? transport.clock.currentTime : performance.now() / 1000;
  const elapsed = now - transport.started;
  if (elapsed < 0) return { slot: transport.slot, step: 0 };
  const step = Math.floor(elapsed / transport.stepDur);
  if (!transport.loop && step >= SFX_STEPS) return null;
  return { slot: transport.slot, step: ((step % SFX_STEPS) + SFX_STEPS) % SFX_STEPS };
}

function context(): AudioContext | null {
  const Ctor =
    globalThis.AudioContext ??
    (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audio) audio = new Ctor();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function haltNodes(): void {
  for (const node of nodes) {
    try {
      node.stop();
    } catch {
      /* already stopped */
    }
    node.disconnect();
  }
  nodes = [];
}

export function stopSfx(): void {
  playToken += 1;
  transport = null;
  haltNodes();
}

function pitchHz(applied: AppliedSfx, spec: ChipSpec, index: number): number {
  const pitch = applied.pitch[index] ?? 0;
  const [lo, hi] = spec.pitchHz;
  const t = pitchTo01(pitch);
  return lo * (hi / lo) ** t;
}

function envelope(elapsed: number, attack: number, decay: number): number {
  if (elapsed < attack) return attack <= 0.0001 ? 1 : elapsed / attack;
  const fall = elapsed - attack;
  if (fall >= decay) return 0;
  return 1 - fall / Math.max(decay, 0.0001);
}

function pulseWave(ctx: AudioContext, duty: number): PeriodicWave {
  const key = Math.round(duty * 100);
  const cached = pulseWaves.get(key);
  if (cached) return cached;
  const real = new Float32Array(32);
  const imag = new Float32Array(32);
  const width = Math.min(0.9, Math.max(0.05, duty));
  for (let harmonic = 1; harmonic < real.length; harmonic += 1) {
    imag[harmonic] = (2 / (harmonic * Math.PI)) * Math.sin(harmonic * Math.PI * width);
  }
  const wave = ctx.createPeriodicWave(real, imag);
  pulseWaves.set(key, wave);
  return wave;
}

function customWave(ctx: AudioContext): PeriodicWave {
  if (waveTable) return waveTable;
  const real = new Float32Array([0, 0.6, 0.3, 0.15, 0.08]);
  const imag = new Float32Array(real.length);
  waveTable = ctx.createPeriodicWave(real, imag);
  return waveTable;
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === ctx.sampleRate) return noise;
  const length = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let state = 0x12345678;
  for (let index = 0; index < length; index += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    data[index] = ((state >>> 0) / 4294967296) * 2 - 1;
  }
  noise = buffer;
  return buffer;
}

function beginTransport(slot: number, started: number, stepDur: number, loop: boolean, clock: AudioContext | null): void {
  transport = { slot, started, stepDur, loop, clock };
}

function schedule(ctx: AudioContext, applied: AppliedSfx, token: number, slot: number): void {
  if (playToken !== token) return;
  const spec = CHIPS[applied.chip];
  const stepDur = lerpRange(spec.stepSeconds, knobTo01(applied.knobs.rate));
  const started = ctx.currentTime + 0.02;
  beginTransport(slot, started, stepDur, applied.loop, ctx);
  const end = started + stepDur * SFX_STEPS;
  const attack = lerpRange(spec.attackSeconds, knobTo01(applied.knobs.attack));
  const decay = lerpRange(spec.decaySeconds, knobTo01(applied.knobs.decay));
  const master = ctx.createGain();
  master.gain.value = 0.22 * knobTo01(applied.knobs.vol);
  let destination: AudioNode = master;
  if (applied.cutoff !== null) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lerpRange(spec.filterHz, applied.cutoff);
    filter.connect(master);
    destination = filter;
  }
  master.connect(ctx.destination);

  const voiceGain = ctx.createGain();
  voiceGain.gain.value = 0;
  voiceGain.connect(destination);

  let source: AudioScheduledSourceNode;
  if (applied.wave === "noise") {
    const buffer = ctx.createBufferSource();
    buffer.buffer = noiseBuffer(ctx);
    buffer.loop = true;
    source = buffer;
  } else {
    const osc = ctx.createOscillator();
    setOscWave(ctx, osc, applied.wave, applied.duty);
    source = osc;
  }
  source.connect(voiceGain);

  if (applied.wave !== "noise" && knobTo01(applied.knobs.vibrato) > 0.001) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = spec.vibratoHz;
    depth.gain.value = knobTo01(applied.knobs.vibrato) * 24;
    lfo.connect(depth);
    depth.connect((source as OscillatorNode).frequency);
    lfo.start(started);
    lfo.stop(end);
    nodes.push(lfo);
  }

  for (let index = 0; index < SFX_STEPS; index += 1) {
    const time = started + index * stepDur;
    const elapsed = index * stepDur;
    const amp = volumeTo01(applied.volume[index] ?? 0) * envelope(elapsed, attack, decay);
    voiceGain.gain.setValueAtTime(Math.max(0, amp), time);
    const hz = pitchHz(applied, spec, index);
    const next = pitchHz(applied, spec, Math.min(SFX_STEPS - 1, index + 1));
    const glide = hz + (next - hz) * knobTo01(applied.knobs.slide);
    if (applied.wave === "noise") {
      const rate = 0.35 + (hz / spec.pitchHz[1]) * 1.4;
      (source as AudioBufferSourceNode).playbackRate.setValueAtTime(rate, time);
    } else {
      const freq = (source as OscillatorNode).frequency;
      freq.setValueAtTime(hz, time);
      freq.linearRampToValueAtTime(Math.max(1, glide), time + stepDur);
    }
  }

  source.onended = () => {
    source.onended = null;
    if (playToken !== token) return;
    if (!applied.loop) {
      transport = null;
      return;
    }
    haltNodes();
    schedule(ctx, applied, token, slot);
  };
  source.start(started);
  source.stop(end);
  nodes.push(source);
}

function setOscWave(ctx: AudioContext, osc: OscillatorNode, wave: WaveId, duty: number): void {
  if (wave === "saw") {
    osc.type = "sawtooth";
    return;
  }
  if (wave === "tri") {
    osc.type = "triangle";
    return;
  }
  if (wave === "wave") {
    osc.setPeriodicWave(customWave(ctx));
    return;
  }
  const width = wave === "pls" ? Math.max(0.05, duty * 0.5) : duty;
  osc.setPeriodicWave(pulseWave(ctx, width));
}

/** Plays slot n from the live bank. v1: one sound at a time; channel mixing comes later. */
export function playSfx(slot: number): void {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SFX_SLOTS) return;
  const bank = getSfxBank();
  const sound = bank.slots[slot];
  if (!sound) return;
  const applied = applyChip(sound, bank.chip);
  for (const listener of appliedListeners) listener(applied);
  stopSfx();
  const token = playToken;
  for (const listener of playListeners) listener(slot);
  const spec = CHIPS[applied.chip];
  const stepDur = lerpRange(spec.stepSeconds, knobTo01(applied.knobs.rate));
  const clock = context();
  if (!clock) {
    beginTransport(slot, performance.now() / 1000, stepDur, applied.loop, null);
    return;
  }
  schedule(clock, applied, token, slot);
}