import { GameObject } from "../../../core/GameObject";
import {
  ScrollingBackgroundComponent,
  type ParallaxLayerConfig,
} from "../../../core/components/Render/ScrollingBackgroundComponent";

import { TEXTURE_STARS_LAYER_1, TEXTURE_STARS_LAYER_2 } from "../../publicAssets";

const defaultLayers: ParallaxLayerConfig[] = [
  {
    texturePath: TEXTURE_STARS_LAYER_1,
    speedY: 0.35,
    direction: "vertical",
    alpha: 0.7,
  },
  {
    texturePath: TEXTURE_STARS_LAYER_2,
    speedY: 0.9,
    direction: "vertical",
    alpha: 1,
  },
];

export class ParallaxBackground extends GameObject {
  constructor(layersConfig: ParallaxLayerConfig[] = defaultLayers) {
    super();
    this.name = "ParallaxBackground";

    this.addComponent(new ScrollingBackgroundComponent(layersConfig));
  }
}
