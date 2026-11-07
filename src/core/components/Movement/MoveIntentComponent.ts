import { Component } from "../Component";

/** Per-object movement intent: input writers update this; one mover reads it. */
export class MoveIntentComponent extends Component {
  /** Game-space hold target while playfield pointer is active. */
  pointerTarget: { x: number; y: number } | null = null;
  /** -1, 0, or +1 from keyboard actions this frame. */
  keyboardAxisX = 0;
  keyboardAxisY = 0;
}
