import { Engine } from "./core/Engine";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./core/display";
import { Beast2D16 } from "./core/ui/palette";
import { configurePixelArtRendering } from "./core/displayScale";

// Pixi global default: nearest-neighbor texture sampling (no blur when scaling).
// Must run before any Assets.load / texture creation (level modules may load art).
configurePixelArtRendering();
import { Level1 } from "./game/Level1";
import { Level2 } from "./game/Level2";
import { SpaceShooter } from "./game/Space Shooter/SpaceShooter";
import { BunnyHop } from "./game/Bunny Hop/BunnyHop";
import { BreakoutPaddle } from "./game/BreakoutPaddle/BreakoutPaddle";
import { helloCart } from "./game/carts/HelloCart";
import helloScript from "./game/carts/hello.script.ts?raw";
import { CartLevel } from "./core/cart/CartLevel";
import { compileCart, guardCart } from "./core/cart/compile";
import { attachDisplayScaleFit } from "./core/displayScale";
import { mountCartEditor } from "./editor/shell";
import { parsePlaySurface } from "./editor/viewMode";
import "./style.css";

const CART_SCRIPT_STORAGE_KEY = "beast2d-cart-script";

const appRoot = document.getElementById("app")!;
const container = document.createElement("div");
container.className = "game-container";
appRoot.appendChild(container);

const engine = new Engine({
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  backgroundColor: Beast2D16.PlumOutline,
  antialias: false,
  debug: false,
});

const bootstrapParams = new URLSearchParams(window.location.search);
if (bootstrapParams.get("resetCart") === "1") {
  localStorage.removeItem(CART_SCRIPT_STORAGE_KEY);
}

engine
  .bootstrap(container)
  .then(async (game) => {
    game.registerLevel("level1", new Level1(engine));
    game.registerLevel("level2", new Level2(engine));
    game.registerLevel("spaceShooter", new SpaceShooter(engine));
    game.registerLevel("bunnyHop", new BunnyHop(engine));
    game.registerLevel("breakoutPaddle", new BreakoutPaddle(engine));

    const levelQuery = bootstrapParams.get("level");

    if (levelQuery) {
      await game.loadLevel(levelQuery);
      return;
    }

    const loadCartLevel = async (cart: typeof helloCart) => {
      const guarded = guardCart(cart, () => {
        game.pause();
      });
      game.registerLevel("helloCart", new CartLevel(engine, guarded));
      await game.loadLevel("helloCart");
    };

    if (parsePlaySurface(window.location.search) === "standalone") {
      appRoot.classList.add("beast2d-standalone");
      const stored = localStorage.getItem(CART_SCRIPT_STORAGE_KEY);
      const source = stored ?? helloScript;
      const compiled = compileCart(source);
      if (compiled.ok) {
        await loadCartLevel(compiled.cart);
      } else {
        await loadCartLevel(helloCart);
      }
      attachDisplayScaleFit(container);
      return;
    }

    let shell!: ReturnType<typeof mountCartEditor>;

    const loadCart = async (cart: typeof helloCart) => {
      const guarded = guardCart(cart, (message, line) => {
        game.pause();
        shell.showCode();
        shell.setError(message, line, true);
      });
      game.registerLevel("helloCart", new CartLevel(engine, guarded));
      await game.loadLevel("helloCart");
    };

    shell = mountCartEditor({
      appRoot,
      gameContainer: container,
      game,
      engine,
      initialSource: helloScript,
      loadCart,
      fallbackCart: helloCart,
    });

    await shell.boot();
  })
  .catch((error) => {
    console.error("Failed to start Beast2D engine", error);
  });
