import { test } from "vitest";
import assert from "node:assert/strict";
import { encodeWav, EXPORT_SAMPLE_RATE } from "../src/shared/audio/wav.js";

function ascii(view: DataView, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index += 1)
    text += String.fromCharCode(view.getUint8(offset + index));
  return text;
}

test("the WAV header describes 16-bit PCM stereo at the export sample rate", () => {
  const frames = 100;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  const bytes = encodeWav([left, right], EXPORT_SAMPLE_RATE);
  const view = new DataView(bytes);
  assert.equal(ascii(view, 0, 4), "RIFF");
  assert.equal(ascii(view, 8, 4), "WAVE");
  assert.equal(ascii(view, 12, 4), "fmt ");
  assert.equal(view.getUint16(20, true), 1); // PCM format.
  assert.equal(view.getUint16(22, true), 2); // Stereo.
  assert.equal(view.getUint32(24, true), EXPORT_SAMPLE_RATE);
  assert.equal(view.getUint16(34, true), 16); // Bits per sample.
  assert.equal(ascii(view, 36, 4), "data");
  assert.equal(view.getUint32(40, true), frames * 2 * 2);
  assert.equal(bytes.byteLength, 44 + frames * 2 * 2);
  assert.equal(view.getUint32(4, true), bytes.byteLength - 8);
});

test("samples interleave the channels and scale to 16-bit", () => {
  const bytes = encodeWav(
    [new Float32Array([1, 0.5]), new Float32Array([-1, -0.5])],
    EXPORT_SAMPLE_RATE,
  );
  const view = new DataView(bytes);
  assert.equal(view.getInt16(44, true), 32767); // Left frame 0.
  assert.equal(view.getInt16(46, true), -32767); // Right frame 0.
  assert.equal(view.getInt16(48, true), Math.round(0.5 * 32767));
  assert.equal(view.getInt16(50, true), Math.round(-0.5 * 32767));
});

test("out-of-range samples clip instead of wrapping", () => {
  const bytes = encodeWav([new Float32Array([2, -2])], EXPORT_SAMPLE_RATE);
  const view = new DataView(bytes);
  assert.equal(view.getInt16(44, true), 32767);
  assert.equal(view.getInt16(46, true), -32767);
});
