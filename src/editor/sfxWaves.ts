import { WAVE_IDS, type WaveId } from "../core/sfx/chips";
import { Beast2D16 } from "../core/ui/palette";
import { hex } from "./sfxPixelArt";
import { WAVE_SPRITE_H, WAVE_SPRITE_W, waveSpriteUrl } from "./sfx/waveSprites";

export type SfxWavePaintState = {
  dim: boolean;
  selected: boolean;
};

type Rgb = { r: number; g: number; b: number };

function rgb(hexColor: number): Rgb {
  return { r: (hexColor >> 16) & 255, g: (hexColor >> 8) & 255, b: hexColor & 255 };
}

function samePixel(data: Uint8ClampedArray, i: number, c: Rgb): boolean {
  return data[i] === c.r && data[i + 1] === c.g && data[i + 2] === c.b;
}

const SRC = {
  moss: rgb(Beast2D16.MossGreen),
  leaf: rgb(Beast2D16.LeafGreen),
  cream: rgb(Beast2D16.Cream),
};

const waveImages = new Map<WaveId, HTMLImageElement>();

function waveImage(id: WaveId): HTMLImageElement {
  let img = waveImages.get(id);
  if (!img) {
    img = new Image();
    img.src = waveSpriteUrl(id);
    img.decoding = "sync";
    waveImages.set(id, img);
  }
  return img;
}

for (const id of WAVE_IDS) {
  void waveImage(id).decode?.();
}

function applyWavePalette(data: ImageData, state: SfxWavePaintState): void {
  if (!state.dim && !state.selected) return;
  const px = data.data;
  const moss = state.dim ? rgb(Beast2D16.Shadow) : rgb(Beast2D16.Yellow);
  const leaf = state.dim ? rgb(Beast2D16.StoneGray) : rgb(Beast2D16.Orange);
  const cream = state.dim ? rgb(Beast2D16.StoneGray) : SRC.cream;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    if (samePixel(px, i, SRC.moss)) {
      px[i] = moss.r;
      px[i + 1] = moss.g;
      px[i + 2] = moss.b;
    } else if (samePixel(px, i, SRC.leaf)) {
      px[i] = leaf.r;
      px[i + 1] = leaf.g;
      px[i + 2] = leaf.b;
    } else if (samePixel(px, i, SRC.cream)) {
      px[i] = cream.r;
      px[i + 1] = cream.g;
      px[i + 2] = cream.b;
    }
  }
}

/** 32×28 wave key; `pixel` = device pixels per art pixel (matches key scale × chrome). */
export function paintSfxWaveIcon(
  canvas: HTMLCanvasElement,
  wave: WaveId,
  state: SfxWavePaintState,
  pixel = 1,
): void {
  const px = Math.max(1, Math.round(pixel));
  canvas.width = WAVE_SPRITE_W * px;
  canvas.height = WAVE_SPRITE_H * px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const img = waveImage(wave);
  if (!img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(px, 0, 0, px, 0, 0);
  ctx.drawImage(img, 0, 0, WAVE_SPRITE_W, WAVE_SPRITE_H);
  const frame = ctx.getImageData(0, 0, WAVE_SPRITE_W, WAVE_SPRITE_H);
  applyWavePalette(frame, state);
  ctx.putImageData(frame, 0, 0);

  if (state.selected) {
    ctx.fillStyle = hex(Beast2D16.Orange);
    for (let y = 0; y < WAVE_SPRITE_H; y += 1) ctx.fillRect(WAVE_SPRITE_W - 1, y, 1, 1);
    for (let x = 0; x < WAVE_SPRITE_W; x += 1) ctx.fillRect(x, WAVE_SPRITE_H - 1, 1, 1);
  }
}