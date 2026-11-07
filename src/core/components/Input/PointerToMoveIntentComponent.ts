import { Component } from "../Component";
import { MoveIntentComponent } from "../Movement/MoveIntentComponent";
import { PlayfieldPointerTargetComponent } from "./PlayfieldPointerTargetComponent";

/** Copies level playfield pointer target into this object's {@link MoveIntentComponent}. */
export class PointerToMoveIntentComponent extends Component {
  private intent: MoveIntentComponent | null = null;
  private readonly playfieldPointer: PlayfieldPointerTargetComponent;

  constructor(playfieldPointer: PlayfieldPointerTargetComponent) {
    super();
    this.playfieldPointer = playfieldPointer;
  }

  override onInit(): void {
    if (!this.gameObject) return;
    this.intent = this.gameObject.getRequiredComponent(
      MoveIntentComponent,
      this.constructor.name,
    );
  }

  override update(_deltaTime: number): void {
    if (!this.intent) return;
    this.intent.pointerTarget = this.playfieldPointer.getMoveTarget();
  }

  override onDestroy(): void {
    this.intent = null;
  }
}
