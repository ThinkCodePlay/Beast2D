import {
  SEQUENCE_STEP_COUNT,
  toStepVolume,
  WAVEFORM_TYPES,
  type SoundSequence,
} from "./model.js";
import { validRate } from "./rate.js";
import { ringShareFromDial, validPitch } from "./effects.js";
import { createChannel } from "./channel.js";
import { normalizedVolume, scheduleVoice, STEP_SECONDS } from "./synthesis.js";

/**
 * WAV export. Pixi-free, like the rest of the audio engine: one pass of the
 * sequence renders offline through the same voices and channel as Play, so
 * the file sounds like the board, and the WAV bytes are plain data the tests
 * can check directly.
 */

/** The exported file's sample rate: the CD-standard 44100 Hz. */
export const EXPORT_SAMPLE_RATE = 44100;

/**
 * Render one 32-step pass of a sequence, without looping. Every dial applies
 * exactly as on Play: RATE sets the tempo, VOL, PAN and CUT shape the
 * channel, DECAY and PITCH tune each voice, and rests stay silent.
 */
export async function renderSound(
  sequence: SoundSequence,
): Promise<AudioBuffer> {
  const stepSeconds = STEP_SECONDS / validRate(sequence.rate);
  const context = new OfflineAudioContext(
    2,
    Math.ceil(SEQUENCE_STEP_COUNT * stepSeconds * EXPORT_SAMPLE_RATE),
    EXPORT_SAMPLE_RATE,
  );
  const channel = createChannel(
    context,
    normalizedVolume(sequence.masterVolume),
    normalizedVolume(sequence.cut),
    normalizedVolume(sequence.pan),
  );
  const waveform = WAVEFORM_TYPES.includes(sequence.waveform)
    ? sequence.waveform
    : "sine";
  const tuning = {
    decayShare: ringShareFromDial(sequence.decay),
    pitchShift: validPitch(sequence.pitch),
  };
  sequence.steps.slice(0, SEQUENCE_STEP_COUNT).forEach((step, index) => {
    if (!step.enabled || !Number.isFinite(step.volume) || step.volume === 0)
      return;
    scheduleVoice(
      context,
      channel.output,
      { ...step, volume: toStepVolume(step.volume) },
      waveform,
      index * stepSeconds,
      stepSeconds,
      tuning,
    );
  });
  return context.startRendering();
}

/**
 * Encode rendered channels as a 16-bit PCM WAV file. Pure data with no Web
 * Audio, so the tests can check the bytes directly.
 */
export function encodeWav(
  channels: readonly Float32Array[],
  sampleRate: number,
): ArrayBuffer {
  const channelCount = channels.length;
  const frames = channels[0]?.length ?? 0;
  const dataSize = frames * channelCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string): void => {
    for (let index = 0; index < text.length; index += 1)
      view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM header size.
  view.setUint16(20, 1, true); // PCM format.
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 2, true);
  view.setUint16(32, channelCount * 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (const channel of channels) {
      const sample = Math.max(-1, Math.min(1, channel[frame]));
      view.setInt16(offset, Math.round(sample * 32767), true);
      offset += 2;
    }
  }
  return buffer;
}
