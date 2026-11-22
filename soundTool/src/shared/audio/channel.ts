import { cutoffFromDial, panFromDial } from "./effects.js";

/** One sound's output chain: gain into low-pass filter into stereo panner. */
export interface SoundChannel {
  /** Channel input: gain, then low-pass filter, then stereo panner, out. */
  output: GainNode;
  filter: BiquadFilterNode;
  panner: StereoPannerNode;
}

/**
 * The channel shared by playback, previews and WAV export. Fully open CUT
 * is a true bypass, so the default sounds exactly as before.
 */
export function createChannel(
  context: BaseAudioContext,
  masterVolume: number,
  cutDial: number,
  panDial: number,
): SoundChannel {
  const output = context.createGain();
  output.gain.value = masterVolume;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoffFromDial(cutDial);
  const panner = context.createStereoPanner();
  panner.pan.value = panFromDial(panDial);
  if (cutDial >= 1) output.connect(panner);
  else output.connect(filter).connect(panner);
  panner.connect(context.destination);
  return { output, filter, panner };
}
