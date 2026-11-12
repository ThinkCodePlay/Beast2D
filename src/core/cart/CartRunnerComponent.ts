import { Container } from "pixi.js";
import { Component } from "../components/Component";
import { DrawList } from "./commands";
import type { Cart } from "./Cart";
import { withCartContext } from "./context";
import { paintDrawList } from "./paint";

/** Calls a cart's init once, then update and draw on every frame. */
export class CartRunnerComponent extends Component {
  private readonly drawList = new DrawList();
  private readonly layer = new Container();
  private readonly cart: Cart;

  constructor(cart: Cart) {
    super();
    this.cart = cart;
  }

  override onInit(): void {
    const context = this.requireContext();
    this.gameObject?.container.addChild(this.layer);
    try {
      withCartContext({ drawList: this.drawList, input: context.input }, () => {
        this.cart.init();
        this.cart.draw();
      });
      paintDrawList(this.layer, this.drawList, context.width, context.height);
    } catch {
      this.drawList.clear();
      this.layer.removeChildren();
    }
    this.drawList.clear();
  }

  override update(_deltaTime: number): void {
    const context = this.requireContext();
    this.drawList.clear();
    try {
      withCartContext({ drawList: this.drawList, input: context.input }, () => {
        this.cart.update(context.time.deltaSeconds);
        this.cart.draw();
      });
      paintDrawList(this.layer, this.drawList, context.width, context.height);
    } catch {
      this.drawList.clear();
      this.layer.removeChildren();
    }
  }

  override onDestroy(): void {
    this.layer.destroy({ children: true });
  }
}
