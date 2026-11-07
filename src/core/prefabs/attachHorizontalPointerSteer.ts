import type { GameObject } from "../GameObject";
import { PointerToMoveIntentComponent } from "../components/Input/PointerToMoveIntentComponent";
import type { PlayfieldPointerTargetComponent } from "../components/Input/PlayfieldPointerTargetComponent";
import { HorizontalKeyboardIntentComponent } from "../components/Movement/HorizontalKeyboardIntentComponent";
import { MoveIntentComponent } from "../components/Movement/MoveIntentComponent";
import { MoveTowardsComponent } from "../components/Movement/MoveTowardsComponent";
import type { MoveTowardsAxes } from "../moveTowards";

/**
 * Level wiring: keyboard + hold-to-steer share {@link MoveIntentComponent};
 * {@link MoveTowardsComponent} is the sole transform writer.
 */
export function attachHorizontalPointerSteer(
  object: GameObject,
  speed: number,
  playfieldPointer: PlayfieldPointerTargetComponent,
  axes: MoveTowardsAxes = { x: true, y: false },
): void {
  object.addComponent(new MoveIntentComponent());
  object.addComponent(new HorizontalKeyboardIntentComponent());
  object.addComponent(new PointerToMoveIntentComponent(playfieldPointer));
  object.addComponent(new MoveTowardsComponent(speed, axes));
}
