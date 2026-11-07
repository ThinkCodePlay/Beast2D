import { GameObject } from "../GameObject";
import { PlayfieldPointerTargetComponent } from "../components/Input/PlayfieldPointerTargetComponent";

/** Level helper: DOM pointer → logical playfield coordinates. */
export function spawnPlayfieldPointerInput(): {
  object: GameObject;
  target: PlayfieldPointerTargetComponent;
} {
  const target = new PlayfieldPointerTargetComponent();
  const object = new GameObject();
  object.name = "PlayfieldPointerInput";
  object.addComponent(target);
  return { object, target };
}
