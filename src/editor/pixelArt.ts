/** 1-character palette keys used by console pixel art. `.` is empty. */
const PIXEL_COLORS: Record<string, string> = {
  p: "#e86c9a",
  m: "#c1386e",
  c: "#f4ead2",
  y: "#f1c766",
  g: "#93be64",
  o: "#e28649",
  b: "#7ab2d5",
  d: "#1f1424",
  s: "#3b2e3f",
  n: "#746678",
  w: "#f4ead2",
  r: "#cb4a50",
  l: "#f7abcc",
  u: "#3a5b93",
  e: "#4a784d",
  k: "#8a5a44",
};

const STONE = "#746678";
const PINK = "#e86c9a";

export type PixelGrid = readonly string[];

/** Angle brackets with a wide empty center so they cannot read as ∞. */
export const TOOL_ICONS: Record<string, PixelGrid> = {
  CODE: [
    "...........",
    ".cc.....cc.",
    "c.........c",
    "c.........c",
    ".cc.....cc.",
    "...........",
  ],
  SPRITE: [
    "......po...",
    ".....poy...",
    "....oyy....",
    "...oyy.....",
    "..oyy......",
    ".oyy.......",
    "oy.........",
    "y..........",
  ],
  MAP: [
    "ccccccccc",
    "c..c..c.c",
    "c..c..c.c",
    "ccccccccc",
    "c..c..c.c",
    "c..c..c.c",
    "ccccccccc",
  ],
  SFX: [
    "..cc.......",
    ".ccc..cc...",
    "ccccc.cc.cc",
    "ccccc.cc.cc",
    ".ccc..cc...",
    "..cc.......",
  ],
  MUSIC: [
    "..c....c...",
    "..c....c...",
    "..c....c...",
    "..cccccc...",
    ".cc....cc..",
    ".cc....cc..",
  ],
};

/**
 * Label stickers for the home shelf.
 * One source pixel per shell pixel, drawn into the blank label above the hub.
 * Titles are not baked in — the shell name band stays empty.
 */
export const DISK_ART: Record<string, PixelGrid> = {
  hello: [
    "llllllllllllllllllllllllllllllllllllllllllll",
    "lllllllllmmmmllllmmmmlllllllllllllllllllllll",
    "llllllllmllllmllmllllmllllllmmllllllllllllll",
    "llllllllmllllmllmllllmlllllmllmlllllllllllll",
    "lllllllllmmmmmmmmmmmmlllllmlllmlllllllllllll",
    "lllllllmmllllllllllmmllllmlllmllllllllllllll",
    "llllllmlllddllllddllmllllmmmllllllllllllllll",
    "llllllmlllccdllcclllmlllllllllllllllllllllll",
    "llllllmlllddllllddllmlllllllllllllllllllllll",
    "llllllmlllllllllllllmlllllllllllllllllllllll",
    "lllllllmmmmmmmmmmmmmmlllllllllllllllllllllll",
    "lllllllllmmllllllmmlllllllllllllllllllllllll",
    "llllllllmlllllllllmlllllllllllllllllllllllll",
    "llllllllmlllllllllmlllllllllllllllllllllllll",
    "lllllllllmmmmmmmmlllllllllllllllllllllllllll",
    "llllllllmllmllmllmllllllllllllllllllllllllll",
    "llllllllmmlmmlmmlmmlllllllllllllllllllllllll",
    "llllllllllllllllllllllllllllllllllllllllllll",
    "llllllllllllllllllllllllllllllllllllllllllll",
    "llllllllllllllllllllllllllllllllllllllllllll",
  ],
  "space-run": [
    "ddddddddddddcddddddddddydddddddddddddddddddd",
    "ddcddddddddddddddddddddddddddddddydddddddddd",
    "dddddddddddddddddddcdddddddddddddddddddddddd",
    "dddddddydddddddddddddddddddddddddddddddcdddd",
    "ddddddddddddddddddbbbbbbdddddddddddddddddddd",
    "ddddddddddddddddbbuwwuubbddddddddddddddddddd",
    "dddddddddddddddbbbbbbbbbbbdddddddddddddddddd",
    "ddddcdddddddddbbdddbbbbdddbbdddddddddddddddd",
    "ddddddddddddddddbbboooobbbdddddddddddddddydd",
    "ddddddddddddddddddoyyyoddddddddddddddddddddd",
    "dddddddddddddddddddooodddddddddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
    "dddddddddcdddddddddddddddddddddddddddddddddd",
    "dddnnndddddddddddddddddddddddddddddddddddddd",
    "ddnkkkndddddddddddddddddddddddddddddyddddddd",
    "ddnkkknddddddddddddddddddddddddddddddddddddd",
    "dddnnndddddddddcddddddddddddddddddddddddddcd",
    "ddddddddddddddddddddddddddddcddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
  ],
  paddle: [
    "ddddddddddydddddddddddddcdddddddddddddyddddd",
    "dddcddddddddddddddddmmddddddddcddddddddddddd",
    "dddddddddddddddddddmllmddddddddddddddddddddd",
    "dddddddddddddddddddmyymdddddddddddddddddddcd",
    "dddddddddddddddddddmllmddddddddddddddddddddd",
    "ddddddddddddddddddmmllmmdddddddddddddddddddd",
    "ddddddcddddddddddmllllllmddddddddddddddddddd",
    "dddddddddddddddddmllllllmddddddddddddddddddd",
    "dddddddddddddddddmllllllmdddddddddddddddyddd",
    "ddddddddddddddddddmmllmmdddddddddddddddddddd",
    "ddcddddddddddddddddmoomddddddddddddddddddddd",
    "ddddddddddddddddddddoodddddddddddddddddddddd",
    "ddddddddddddddddddddyydddddddddddddddddddddd",
    "ddddnnnndddddddddddddodddddddddddddddddddddd",
    "dddncccnnddddddddddddddddddddddddddddddddddd",
    "dddnccnnndddddddddddddddddddddddddddyddddddd",
    "ddddnnnndddddddddddddddddddddddddddddddddddd",
    "ddddddddddddddcddddddddddddddddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
  ],
  "bunny-hop": [
    "ddddddddddddyddddddddddddddddddddddddddddddd",
    "dddcddddddddddddddddddddddddddddddcddddddddd",
    "ddddddddddddddddddddddcddddddddddddddddddddd",
    "dddddddddddddddmmdmmddddddddddddddddddddyddd",
    "ddddddddddddddmlllllmddddddddddddddddddddddd",
    "ddddddddddddddmldldlmddddddddddddddddddddddd",
    "ddddddddddddddmlccllmdddddddddnnnnnndddddddd",
    "ddddddddddddddmlllllmdddddddddnsssdndddddddd",
    "dddeeeeddddddddmmmmmddddddddddnnnnnndddddddd",
    "ddeggggeddddddmddmddmdddddddddndsssndddddddd",
    "deggggggeddddddmmddmmdddddddddnnnnnndddddddd",
    "deggggggedddddddddddddddddddddnsssdndddddddd",
    "ddeeeeeeddddddddddddddddddddddnnnnnndddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
    "dddddddddddddddddddddddddddddddddddddddddddd",
    "ddddddddddggddddddddddddddegdddddddddddddddd",
    "gggggggggggggggggggggggggggggggggggggggggggg",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  ],
};

/** True when every inked row is two side clusters with an empty middle. */
export function iconIsSplitPair(rows: PixelGrid): boolean {
  const inked = rows.filter((row) => row.split("").some((ch) => ch !== "."));
  if (inked.length === 0) return false;
  return inked.every((row) => {
    const width = row.length;
    const mid = row.slice(Math.floor(width / 2) - 1, Math.ceil(width / 2) + 1);
    if ([...mid].some((ch) => ch !== ".")) return false;
    const clusters = row.split(".").filter((part) => part.length > 0);
    return clusters.length === 2;
  });
}

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

function strokeRound(ctx: Ctx, x: number, y: number, w: number, h: number, radius: number, color: string, scale: number): void {
  const r = Math.max(1, radius);
  for (let yy = 0; yy < h; yy += 1) {
    for (let xx = 0; xx < w; xx += 1) {
      if (!inRound(xx, yy, w, h, r)) continue;
      const inner = inRound(xx - 1, yy - 1, w - 2, h - 2, Math.max(0, r - 1));
      if (inner) continue;
      fill(ctx, x + xx, y + yy, 1, 1, color, scale);
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
    centerBlit(ctx, motif, 8, 22, 48, 20, pixel, 1);
  }
  if (selected) strokeRound(ctx, 0, 0, TOOL_FLOPPY_W, TOOL_FLOPPY_H, 8, PINK, pixel);
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
  if (selected) strokeRound(ctx, 0, 0, TOOL_FLOPPY_W, TOOL_FLOPPY_H, 8, PINK, pixel);
}
