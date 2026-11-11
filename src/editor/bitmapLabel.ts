type GlyphFont = {
  glyphW: number;
  glyphH: number;
  glyphs: Record<string, { x: number; y: number }>;
};

let ready: Promise<{ font: GlyphFont; image: HTMLImageElement }> | null = null;

function loadFont(): Promise<{ font: GlyphFont; image: HTMLImageElement }> {
  if (!ready) {
    ready = Promise.all([
      fetch("/ui/font-glyphs.json").then((response) => response.json() as Promise<GlyphFont>),
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("bitmap font atlas failed to load"));
        image.src = "/ui/font-atlas.5x7.png";
      }),
    ]).then(([font, image]) => ({ font, image }));
  }
  return ready;
}

/** Draws one line with the same 5×7 atlas the cart `print` helper uses. */
export async function paintBitmapLabel(
  canvas: HTMLCanvasElement,
  text: string,
  scale: number,
  color: string,
): Promise<void> {
  const { font, image } = await loadFont();
  const gap = 1;
  const advance = font.glyphW + gap;
  const width = Math.max(font.glyphW, text.length * advance - gap) * scale;
  const height = font.glyphH * scale;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const upper = text.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const pos = font.glyphs[upper[i]] ?? font.glyphs[" "];
    if (!pos) continue;
    ctx.drawImage(
      image,
      pos.x,
      pos.y,
      font.glyphW,
      font.glyphH,
      i * advance * scale,
      0,
      font.glyphW * scale,
      font.glyphH * scale,
    );
  }
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}
