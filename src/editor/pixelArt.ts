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
};

export type PixelGrid = readonly string[];

export const TOOL_ICONS: Record<string, PixelGrid> = {
  CODE: ["........", ".pp..pp.", "p..pp..p", "p..pp..p", ".pp..pp.", "........"],
  SPRITE: ["......oo", ".....oo.", "....oo..", "...oo...", "..oo....", ".oo.yy..", "oo..yy..", "....yy.."],
  MAP: ["nnnnnnnn", "n..n..n.", "n..n..n.", "nnnnnnnn", "n..n..n.", "n..n..n.", "nnnnnnnn"],
  SFX: ["..cc....", ".ccc.pp.", "cccc.pp.", "cccc.pp.", ".ccc.pp.", "..cc...."],
  MUSIC: ["....pp..", "....pp..", "....pp..", ".cc.pp..", "ccc.pp..", "ccc.....", ".cc....."],
};

/** Simple label motifs for the home shelf (16×16 or smaller). */
export const DISK_ART: Record<string, PixelGrid> = {
  hello: [
    "....pppppp....",
    "...pppppppp...",
    "..ppwwppwwpp..",
    "..pppppppppp..",
    "...pppppppp...",
    "..pppppppppp..",
    ".pp.pppppp.pp.",
  ],
  "space-run": [
    "......ww......",
    ".....wwww.....",
    "......bb......",
    "...bbbbbbbb...",
    "..bbbbbbbbbb..",
    "...bbyyybb....",
    ".....oooo.....",
    "......oo......",
  ],
  paddle: [
    "..............",
    "......yy......",
    "..............",
    "..............",
    "..............",
    "..oooooooooo..",
    "..............",
  ],
  "bunny-hop": [
    ".cc......cc.",
    ".cc......cc.",
    "..cccccccc..",
    "..ccwwccww..",
    "..cccccccc..",
    "...cccccc...",
    "....c..c....",
  ],
};

/** Pink beast sitting beside the home logo. */
export const BEAST_MASCOT: PixelGrid = [
  "..pppppp..",
  ".pppppppp.",
  "ppwwppwwpp",
  "pppppppppp",
  ".ppmmmmmp.",
  "pppppppppp",
  "p..pppp..p",
  ".p.p..p.p.",
];

export function paintPixelGrid(canvas: HTMLCanvasElement, rows: PixelGrid, scale = 1): void {
  const height = rows.length;
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const pixel = Math.max(1, Math.round(scale));
  canvas.width = width * pixel;
  canvas.height = height * pixel;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < height; y += 1) {
    const row = rows[y] ?? "";
    for (let x = 0; x < row.length; x += 1) {
      const color = PIXEL_COLORS[row[x] ?? ""];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
    }
  }
}

export function createFloppy(icon: PixelGrid, name: string): HTMLElement {
  const floppy = document.createElement("span");
  floppy.className = "beast2d-floppy";
  const shutter = document.createElement("span");
  shutter.className = "beast2d-floppy-shutter";
  const label = document.createElement("span");
  label.className = "beast2d-floppy-label";
  const canvas = document.createElement("canvas");
  canvas.className = "beast2d-pixel";
  paintPixelGrid(canvas, icon, 1);
  label.appendChild(canvas);
  if (name) {
    const caption = document.createElement("span");
    caption.className = "beast2d-floppy-name";
    caption.textContent = name;
    label.appendChild(caption);
  }
  floppy.append(shutter, label);
  return floppy;
}
