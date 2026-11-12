import { btn, cls, print, rectfill } from "../../core/cart/api";
import { BEAST_EMOJI } from "../../core/ui/beastEmoji";
import type { Cart } from "../../core/cart/Cart";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../core/display";

const SPEED = 60;
const SIZE = 8;

let x = 112;
let y = 104;

/** Moves an orange square with the arrow keys and prints HELLO. */
export const helloCart: Cart = {
  init() {
    x = 112;
    y = 104;
  },
  update(dt) {
    if (btn("left")) x -= SPEED * dt;
    if (btn("right")) x += SPEED * dt;
    if (btn("up")) y -= SPEED * dt;
    if (btn("down")) y += SPEED * dt;
    x = Math.min(DISPLAY_WIDTH - SIZE, Math.max(0, x));
    y = Math.min(DISPLAY_HEIGHT - SIZE, Math.max(0, y));
  },
  draw() {
    cls(0);
    rectfill(Math.round(x), Math.round(y), SIZE, SIZE, 10);
    print("HELLO " + BEAST_EMOJI, 8, 8, 4);
  },
};
