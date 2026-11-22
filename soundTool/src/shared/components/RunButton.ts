import { Container, Graphics, Text } from "pixi.js";
import { makePressable } from "../ui/Pressable";

export const RUN_WIDTH = 30;
export const RUN_HEIGHT = 21;

/** Stepped pink RUN badge from the header's right edge. */
export class RunButton extends Container {
  constructor() {
    super();
    this.addChild(
      new Graphics()
        .poly([3, 3, 27, 3, 30, 6, 30, 18, 27, 21, 3, 21, 0, 18, 0, 6])
        .fill(0x24152e)
        .poly([4, 4, 26, 4, 29, 7, 29, 17, 26, 20, 4, 20, 1, 17, 1, 7])
        .fill(0xe85a8c)
        .rect(4, 5, 22, 4)
        .fill(0xff9ebb),
    );
    const label = new Text({
      text: "RUN",
      style: {
        fontFamily: "monogram",
        fontSize: 13,
        fontWeight: "bold",
        fill: 0x8e2b4a,
      },
      resolution: 3,
    });
    label.position.set(7, 5);
    this.addChild(label);
    makePressable(this);
  }
}
