import { GameObject } from "../GameObject";
import { Level } from "../Level";
import { BEAST_EMOJI_PATH } from "../ui/beastEmoji";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../ui/defaultBitmapFont";
import type { Cart } from "./Cart";
import { CartRunnerComponent } from "./CartRunnerComponent";

/** A level whose whole picture comes from one cart module. */
export class CartLevel extends Level {
  override assets = [DEFAULT_BEAST2D_BITMAP_FONT.atlasPath, BEAST_EMOJI_PATH];
  private readonly cart: Cart;

  constructor(engine: ConstructorParameters<typeof Level>[0], cart: Cart) {
    super(engine);
    this.cart = cart;
    this.showHud = false;
  }

  protected init(): void {
    const host = new GameObject();
    host.name = "CartHost";
    // Keep drawing while the console shell pauses game time (home / boot).
    host.runWhenPaused = true;
    host.addComponent(new CartRunnerComponent(this.cart));
    this.levelRoot.addChild(host);
  }
}
