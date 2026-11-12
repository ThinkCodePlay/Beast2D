import type { ConsoleDisk } from "./consoleTypes";

/** Shelf disks shown on the home screen (cart + example levels). */
export const DEFAULT_CONSOLE_DISKS: ConsoleDisk[] = [
  { id: "hello", title: "Hello", kind: "cart" },
  { id: "space-run", title: "Space Run", kind: "level", levelId: "spaceShooter" },
  { id: "paddle", title: "Paddle", kind: "level", levelId: "breakoutPaddle" },
  { id: "bunny-hop", title: "Bunny Hop", kind: "level", levelId: "bunnyHop" },
];
