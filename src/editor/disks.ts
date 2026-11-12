import type { ConsoleDisk } from "./consoleTypes";

/** Shelf disks shown on the home screen (cart + example levels). */
export const DEFAULT_CONSOLE_DISKS: ConsoleDisk[] = [
  { id: "hello", title: "Hello", kind: "cart", builtIn: true },
  { id: "space-run", title: "Space Run", kind: "level", levelId: "spaceShooter", builtIn: true },
  { id: "paddle", title: "Paddle", kind: "level", levelId: "breakoutPaddle", builtIn: true },
  { id: "bunny-hop", title: "Bunny Hop", kind: "level", levelId: "bunnyHop", builtIn: true },
];

export function diskById(disks: ConsoleDisk[], id: string): ConsoleDisk | undefined {
  return disks.find((d) => d.id === id);
}
