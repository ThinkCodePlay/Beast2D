/** Runtime Beast2D 16 palette (0xRRGGBB). Keep in sync with `docs/palette/beast2d-16.json`. */
export const Beast2D16 = {
  PlumOutline: 0x1f1424,
  DirtBrown: 0x8a5a44,
  Shadow: 0x3b2e3f,
  StoneGray: 0x746678,
  Cream: 0xf4ead2,
  DeepRose: 0x75273c,
  Magenta: 0xc1386e,
  HotPink: 0xe86c9a,
  LightPink: 0xf7abcc,
  Red: 0xcb4a50,
  Orange: 0xe28649,
  Yellow: 0xf1c766,
  MossGreen: 0x4a784d,
  LeafGreen: 0x93be64,
  Blue: 0x3a5b93,
  SkyBlue: 0x7ab2d5,
} as const;

export const BEAST2D16_LIST: readonly number[] = Object.freeze([
  Beast2D16.PlumOutline,
  Beast2D16.DirtBrown,
  Beast2D16.Shadow,
  Beast2D16.StoneGray,
  Beast2D16.Cream,
  Beast2D16.DeepRose,
  Beast2D16.Magenta,
  Beast2D16.HotPink,
  Beast2D16.LightPink,
  Beast2D16.Red,
  Beast2D16.Orange,
  Beast2D16.Yellow,
  Beast2D16.MossGreen,
  Beast2D16.LeafGreen,
  Beast2D16.Blue,
  Beast2D16.SkyBlue,
]);

const BEAST2D16_SET = new Set<number>(BEAST2D16_LIST);

export function isBeast2D16Color(rgb: number, alpha = 255): boolean {
  if (alpha === 0) return true;
  return BEAST2D16_SET.has(rgb & 0xffffff);
}
