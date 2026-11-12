import { Beast2D16 } from "../core/ui/palette";

function paletteCss(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** 1-character palette keys used by console pixel art. `.` is empty. */
const PIXEL_COLORS: Record<string, string> = {
  p: paletteCss(Beast2D16.HotPink),
  m: paletteCss(Beast2D16.Magenta),
  c: paletteCss(Beast2D16.Cream),
  y: paletteCss(Beast2D16.Yellow),
  g: paletteCss(Beast2D16.LeafGreen),
  o: paletteCss(Beast2D16.Orange),
  b: paletteCss(Beast2D16.SkyBlue),
  d: paletteCss(Beast2D16.PlumOutline),
  s: paletteCss(Beast2D16.Shadow),
  n: paletteCss(Beast2D16.StoneGray),
  r: paletteCss(Beast2D16.Red),
  l: paletteCss(Beast2D16.LightPink),
  u: paletteCss(Beast2D16.Blue),
  e: paletteCss(Beast2D16.MossGreen),
  k: paletteCss(Beast2D16.DirtBrown),
};

const STONE = paletteCss(Beast2D16.StoneGray);
const PINK = paletteCss(Beast2D16.HotPink);

export type PixelGrid = readonly string[];

/**
 * Label stickers for the home shelf. Each grid is the full label
 * (51×22, one shell pixel per cell) so the motif fills the face.
 * Titles stay off the shell — the name band is left empty.
 */
export const DISK_ART: Record<string, PixelGrid> = {
  "hello": [
    "lllllllllllllmmmmmmllllllmmmmmmlllllllllllllllmmlll",
    "lllllllllllllmmppmmllllllmmppmmllllllllllllllmmmmml",
    "llllllllllllmmppppmmllllmmppppmmlllllllllllmmmlllml",
    "llllllllllllmmppppmmllllmmppppmmllllllllllmmmllllml",
    "llllllllllllmppppppmllllmppppppmllllllllmmmpmmlllml",
    "llllllllllllmppmmmmmmmmmmmmmmppmlllllllmmppppmmmmml",
    "llllllllllllmmmmmppppppppppmmmmmlllllmmmppppppmmmll",
    "llllllllllmmmppppppppppppppppppmmmllmmppppppppmllll",
    "llllllllmmmppppppppppppppppppppppmmmppppppppmmlllll",
    "lllllllmmmpppppppppppppppppppppppmmpppppppmmlllllll",
    "lllllllmmpppppddddppppppppddddpppmpppppppmmllllllll",
    "llllllmmppppppddccppppppppddccpppmpppppmmllllllllll",
    "llllllmmpppppddddddppppppddddddppmmppmmmlllllllllll",
    "llllmmllmmppppddddppppppppddddppppmmmmlllllllllllll",
    "llllmllllmpppppddppppppppppddpppppppmmlllllllllllll",
    "llllmllllmppppppppppppppppppppppppppmmlllllllllllll",
    "llllmmllmmpppppppppmpppppmpppppppppmmllllllllllllll",
    "llllllmmmmppppppppppmmmmmpppppppppmmlllllllllllllll",
    "lllllllllmmmmmmmmppppppppmmmmmmpmmmllllllllllllllll",
    "llllllllllmmppppmmppppppmmppppmmmllllllllllllllllll",
    "llllllllllmppppppmmmmmmmmppppppmlllllllllllllllllll",
    "llllllllllmmmppmmmmmmmmmmmmppmmmlllllllllllllllllll",
  ],
  "space-run": [
    "dddddddddddddddddddddddccccdddddddddddddddddddddddd",
    "ddcdddddddddddddddddduccbbccudddddddddddddddddcdddd",
    "dddddddddddddddddddduucbbbbcuuddddddddddddddddddddd",
    "ddddddddddddddddddduubcbbbbcbuudddddddddcdddddddddd",
    "ddddddydddddduuuuuuubbccbbccbbuuuuuuudddddddddddddd",
    "ddddddddduuuuuuuuuuubbbbccbbbbuuuuuuuuuuudddddddddd",
    "dddddduuuuubbbbbbuubbbbccccbbbbuubbbbbbuuuuuddddydd",
    "ddddduuubbbbbbbbbuubbbccuuccbbbuubbbbbbbbbuuudddddd",
    "dddduubbbbbbbbbbbuubbbcuuuucbbbuubbbbbbbbbbbuuddddd",
    "ddduubbbbbbbbbbbbuubbbccuuccbbbuubbbbbbbbbbbbuudddd",
    "ddduubccbbbbbbbbbuubbbbbccbbbbbuubbbbbbbbbbccuudddd",
    "dddduubbbbbbbbbbbuuubbbbbbbbbbuuubbbbbbbbbbbuuddddd",
    "ddddduuubbbbbbbbbbuubbbbbbbbbbuubbbbbbbbbbuuudddddd",
    "dddddduuuuubbbbbbbuuubbbbbbbbuuubbbbbbbuuuuuddddddd",
    "ddddddddduuuuuuuuubuuuoooooouuubuuuuuuuuuddddddddyd",
    "ddddddddddddduuuuuuuoooooooooouuuuuuudddddddddddddd",
    "ddddddddddddddddddddooyyyyyyooddddddddddddddddddddd",
    "ddddddddddddddddddddooyyccyyooddddddddddddddddddddd",
    "ddcddddddddddddddddddoyccccyodddddddddddddddddddddd",
    "ddddddddddddddddddddddddooddddddddddddddddddcdddddd",
    "ddddddddydddddddddddddddddddddddddddddddddddddddddd",
    "ddddddddddddddddddddddddddddddddddddddddddddddddddd",
  ],
  "paddle": [
    "dddddddddddddddddddddddddddddddddddddmmmmmmmmmmmmdd",
    "ddddddddddddddddddddddddddddddddddmmmmpppmllllmmmdd",
    "ddcdddddddddddddddddddddddddddddmmmmppppmmllllmmmdd",
    "ddddddddddddddddddddddddddddddmmmmppppppmmllllmmmdd",
    "ddddddddddddddddddddddddddddmmmmpppppppppmllllmmmdd",
    "ddddddddddddddddddddddddddmmmmpppppppppppmmmmmmmmdd",
    "dddcddddddddddddddddddddmmmppppppppppppppppmmmmmddd",
    "dddddddddddddddddddddmmmmpppppyyyypppppppppmmmmdddd",
    "dddddddddddmmmmddddmmmmpppppppyccypppppppmmmmdddddd",
    "dddddddddddmmmmmdmmmmpppppppppyccypppppmmmmdddddddd",
    "ddddddnndddmmmmmmmmpppppppppppyyyypppmmmmdddddddddd",
    "ddddnnnnnndmmmmmmmmppppppppppppppppmmmmdddddddddddd",
    "dddnkkkkkkndmmmmmmmmpppppppppppppmmmddddddddddddddd",
    "ddnkccckkkkmmmmoommmmmppppppppmmmmddddddddddddddddd",
    "ddncccckkkkmmooyyommmmppppppmmmmddddddddddddddddddd",
    "dnnkccckkkkoooyyyyommmppppmmmmddddddddddddddddddddd",
    "dnnkkkkkkoooyyyyyyommmmpmmmmddddddddddddddddddddddd",
    "ddnkkkkooooyyyyyyommmmmmmmddddddddddddddddddddddddd",
    "ddnkkkooooyyyyyoopmmmmmmmmddddddddddddddddddddddddd",
    "dddnkooccyyyyyommmmmmmmmmmddddddddddddddddddddddddd",
    "ddddnoccccyyymmmmmmddmmmmmddddddddddddddddddddddddd",
    "ddddddoccyydddddddddddmmmmddddddddddddddddddddddddd",
  ],
  "bunny-hop": [
    "ddddddddddddddddddddmmmmdddmmmmdddddddddddddddddddd",
    "ddddddddddddddddddddmppmdddmppmdddddddddddddddydddd",
    "ddcdddddddddddddddddmppmdddmppmdddddnnnnnnnnnnnnddd",
    "ddddddddddddddddddddmpmmmmmmmpmdddddnssssssssssnddd",
    "ddddeeeeeeeeddddddddmmmpppppmmmdddddnssssssssssnddd",
    "ddeeggggggggeeddddddmpppppppppmdddddnnnnnnnnnnnnddd",
    "deeggggggggggeeddddmmpddpppddpmmddddddnnnnnnnnnnndd",
    "eeggggggggggggeedddmppdcdpddcppmddddddnsssssssssndd",
    "eeggggggggggggeedddmppddpppddppmddddddnsssssssssndd",
    "eeggggggggggggeedddmpppppppppppmddddddnnnnnnnnnnndd",
    "eeggggggggggggeedddmmpppppppppmmddnnnnnnnnnnnnnnddd",
    "eeggggggggggggeedddmmmpppppppmmmddnssssssssssssnddd",
    "eeeggggggggggeeeddmmmmmmmmmmmmmmmdnssssssssssssnddd",
    "deeeeggggggeeeeddmmmmmmmmmmmmmmmmmnnnnnnnnnnnnnnddd",
    "ddeeeeeeeeeeeeddddmmmmdddddddmmmmdnnnnnnnnnnnnnnddd",
    "ggggggggggggggggggggggggggggggggggggggggggggggggggg",
    "ggggggggggggggggggggggggggggggggggggggggggggggggggg",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  ],
};

type Ctx = CanvasRenderingContext2D;

function fill(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, scale: number): void {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

function inRound(x: number, y: number, w: number, h: number, radius: number): boolean {
  const r = Math.max(0, Math.min(radius, Math.floor(Math.min(w, h) / 2)));
  if (r <= 0) return x >= 0 && y >= 0 && x < w && y < h;
  let dx = 0;
  let dy = 0;
  if (x < r) dx = r - x;
  else if (x >= w - r) dx = x - (w - 1 - r);
  if (y < r) dy = r - y;
  else if (y >= h - r) dy = y - (h - 1 - r);
  return dx * dx + dy * dy <= r * r;
}

/**
 * Opaque body shared by the home shell and the tool floppies.
 * Top-right is a one-pixel stair; the other three corners are square.
 */
function inFloppyBody(x: number, y: number): boolean {
  if (y < 3 || y > 68 || x < 3) return false;
  const maxX = y <= 10 ? 53 + (y - 3) : 60;
  return x <= maxX;
}

/** Same gap the old frame used: three pixels outside the body, one pixel thick. */
const FLOPPY_FRAME_OFFSET = 3;

function nearFloppyBody(x: number, y: number, dist: number): boolean {
  for (let dy = -dist; dy <= dist; dy += 1) {
    for (let dx = -dist; dx <= dist; dx += 1) {
      if (inFloppyBody(x + dx, y + dy)) return true;
    }
  }
  return false;
}

/** Hot-pink selection pixel. Traces the chamfered silhouette, not a rounded rect. */
export function isFloppySelectionPixel(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= TOOL_FLOPPY_W || y >= TOOL_FLOPPY_H) return false;
  if (nearFloppyBody(x, y, FLOPPY_FRAME_OFFSET - 1)) return false;
  return nearFloppyBody(x, y, FLOPPY_FRAME_OFFSET);
}

function strokeFloppyFrame(ctx: Ctx, color: string, scale: number): void {
  for (let y = 0; y < TOOL_FLOPPY_H; y += 1) {
    for (let x = 0; x < TOOL_FLOPPY_W; x += 1) {
      if (!isFloppySelectionPixel(x, y)) continue;
      fill(ctx, x, y, 1, 1, color, scale);
    }
  }
}

const HOME = { w: 64, h: 72, pad: 3 };

/** Native 64×72 tool disks. Drawn nearest-neighbor; the pink frame stays separate. */
export const TOOL_FLOPPY_SRC: Record<string, string> = {
  CODE: "/ui/floppy-code.png",
  SPRITE: "/ui/floppy-sprite.png",
  MAP: "/ui/floppy-map.png",
  SFX: "/ui/floppy-sfx.png",
  MUSIC: "/ui/floppy-music.png",
};

const TOOL_FLOPPY_W = 64;
const TOOL_FLOPPY_H = 72;
const toolFloppyImages = new Map<string, HTMLImageElement>();

/** Blank 64×72 shell for the home shelf. Tool PNGs keep their own baked names. */
export const HOME_SHELL_SRC = "/ui/floppy-home.png";

let homeShellImage: HTMLImageElement | null = null;

function homeShell(): HTMLImageElement {
  if (!homeShellImage) {
    homeShellImage = new Image();
    homeShellImage.src = HOME_SHELL_SRC;
  }
  return homeShellImage;
}

function toolFloppyImage(tool: string): HTMLImageElement {
  const src = TOOL_FLOPPY_SRC[tool] ?? TOOL_FLOPPY_SRC.CODE!;
  let image = toolFloppyImages.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    toolFloppyImages.set(src, image);
  }
  return image;
}

function centerBlit(
  ctx: Ctx,
  grid: PixelGrid,
  areaX: number,
  areaY: number,
  areaW: number,
  areaH: number,
  scale: number,
  dot = 1,
): void {
  const gh = grid.length * dot;
  const gw = grid.reduce((max, row) => Math.max(max, row.length), 0) * dot;
  const ox = areaX + Math.max(0, Math.floor((areaW - gw) / 2));
  const oy = areaY + Math.max(0, Math.floor((areaH - gh) / 2));
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y] ?? "";
    for (let x = 0; x < row.length; x += 1) {
      const color = PIXEL_COLORS[row[x] ?? ""];
      if (!color) continue;
      fill(ctx, ox + x * dot, oy + y * dot, dot, dot, color, scale);
    }
  }
}

export function paintHomeFloppy(
  canvas: HTMLCanvasElement,
  diskId: string,
  selected: boolean,
  scale: number,
): void {
  const pixel = Math.max(1, Math.round(scale));
  canvas.width = TOOL_FLOPPY_W * pixel;
  canvas.height = TOOL_FLOPPY_H * pixel;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const image = homeShell();
  if (image.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    image.addEventListener("load", () => paintHomeFloppy(canvas, diskId, selected, scale), { once: true });
  }
  const motif = DISK_ART[diskId];
  if (motif) {
    centerBlit(ctx, motif, 8, 21, 51, 22, pixel, 1);
  }
  if (selected) strokeFloppyFrame(ctx, PINK, pixel);
}

export function paintEmptySlot(canvas: HTMLCanvasElement, scale: number): void {
  const pixel = Math.max(1, Math.round(scale));
  canvas.width = HOME.w * pixel;
  canvas.height = HOME.h * pixel;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const x = HOME.pad;
  const y = HOME.pad;
  const w = HOME.w - HOME.pad * 2;
  const h = HOME.h - HOME.pad * 2;
  const radius = 7;
  for (let yy = 0; yy < h; yy += 1) {
    for (let xx = 0; xx < w; xx += 1) {
      if (!inRound(xx, yy, w, h, radius)) continue;
      const inner = inRound(xx - 1, yy - 1, w - 2, h - 2, radius - 1);
      if (inner) continue;
      if ((xx + yy) % 2 !== 0) continue;
      fill(ctx, x + xx, y + yy, 1, 1, STONE, pixel);
    }
  }
}

export function paintToolFloppy(
  canvas: HTMLCanvasElement,
  tool: string,
  selected: boolean,
  scale: number,
): void {
  const pixel = Math.max(1, Math.round(scale));
  canvas.width = TOOL_FLOPPY_W * pixel;
  canvas.height = TOOL_FLOPPY_H * pixel;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const image = toolFloppyImage(tool);
  if (image.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    image.addEventListener("load", () => paintToolFloppy(canvas, tool, selected, scale), { once: true });
  }
  if (selected) strokeFloppyFrame(ctx, PINK, pixel);
}
