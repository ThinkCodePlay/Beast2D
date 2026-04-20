import { Container } from "pixi.js";
import { GameObject } from "../../../core/GameObject";
import {
  ParallaxBackgroundRenderComponent,
  type ParallaxLayerConfig,
} from "../../../core/components/Render/ParallaxBackgroundRenderComponent";

const defaultLayers: ParallaxLayerConfig[] = [
  {
    texturePath: "background/Stars-Big_1_1_PC.png",
    speedY: 0.35,
    direction: "vertical",
    alpha: 0.7,
  },
  {
    texturePath: "background/Stars-Big_1_2_PC.png",
    speedY: 0.9,
    direction: "vertical",
    alpha: 1,
  },
];

export class ParallaxBackground extends GameObject {
  constructor(
    container: Container,
    layersConfig: ParallaxLayerConfig[] = defaultLayers,
  ) {
    super(container);
    this.name = "ParallaxBackground";

    this.addComponent(new ParallaxBackgroundRenderComponent(layersConfig));
  }
}
