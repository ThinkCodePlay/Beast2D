# Cart mode

A **cart** is one module with `init`, `update(dt)`, and `draw`. It runs on the same engine as component levels. `dt` is seconds.

Drawing is immediate. `draw()` records commands, and `CartRunnerComponent` paints them after it returns. The next frame starts from an empty list, so the cart redraws the whole screen every time.

Helpers throw when they are called outside a running cart. Component levels do not install a cart context.

## A cart

```ts
import { btn, cls, print, rectfill } from "../../core/cart/api";
import type { Cart } from "../../core/cart/Cart";

let x = 112;
let y = 104;

export const helloCart: Cart = {
  init() {
    x = 112;
    y = 104;
  },
  update(dt) {
    if (btn("right")) x += 60 * dt;
  },
  draw() {
    cls(0);
    rectfill(Math.round(x), y, 8, 8, 10);
    print("HELLO", 8, 8, 4);
  },
};
```

Register it like any other level. `CartLevel` skips the lives/score band and preloads the bitmap font.

```ts
game.registerLevel("helloCart", new CartLevel(engine, helloCart));
await game.loadLevel("helloCart");
```

The hello cart in `src/game/carts/HelloCart.ts` is loaded by default from `src/main.ts`.

## In-browser editor

`pnpm run dev` loads the cart script from `src/game/carts/hello.script.ts`. **Esc** toggles run and code. **Run** (or Ctrl+Enter) compiles the buffer and restarts the cart. **Save** (Ctrl+S) overwrites `hello.script.ts` through the dev server only; production builds disable Save and keep drafts in `localStorage`.

The script shape has no imports. Declare `init`, `update(dt)`, and `draw`, and use `cls`, `rect`, `rectfill`, `print`, `btn`, and `btnp` in scope. `dt` is seconds. The playfield is 320×240; use those literals or your own constants.

```js
let x = 112;

function init() {
  x = 112;
}

function update(dt) {
  if (btn("right")) x += 60 * dt;
}

function draw() {
  cls(0);
  rectfill(Math.round(x), 104, 8, 8, 10);
  print("HELLO", 8, 8, 4);
}
```

## Helpers

Colors are palette indexes `0` through `15` (`Beast2D16`). `0` is plum, `4` is cream, `10` is orange.

| Helper | Effect |
| --- | --- |
| `cls(color)` | Fills the 320×240 screen. |
| `rect(x, y, w, h, color)` | 1 px outline. |
| `rectfill(x, y, w, h, color)` | Filled rectangle. |
| `print(text, x, y, color, scale?)` | Bitmap text. `scale` defaults to `1`. `2` draws the same 5×7 glyphs at double size. |
| `btn(action)` | True while the action is held. |
| `btnp(action)` | True on the frame the action was pressed. |

Actions match the engine bindings: `left`, `right`, `up`, `down`, `shoot`.

`print` measures like the rest of the bitmap font: each glyph is 5 px wide with 1 px of letter spacing, multiplied by `scale`. `HELLO` at scale 1 is 29 px wide.
