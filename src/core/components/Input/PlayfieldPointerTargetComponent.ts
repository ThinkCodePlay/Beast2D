import { DialogUI } from "../UI/DialogUI";
import { clientToGameCoords } from "../../pointer/clientToGameCoords";
import { Component } from "../Component";
import type { MoveTowardsTargetSource } from "../Movement/MoveTowardsComponent";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../consts";

/**
 * Tracks the primary pointer on the gameplay canvas and exposes game-space
 * coordinates for {@link MoveTowardsComponent}. Ignores gameplay steering
 * while the game is paused or a dialog is open (UI uses Pixi hit targets).
 */
export class PlayfieldPointerTargetComponent
  extends Component
  implements MoveTowardsTargetSource
{
  private target: { x: number; y: number } | null = null;
  private activePointerId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readonly onWindowBlur = () => this.clearPointer();
  private readonly onPointerDown = (event: PointerEvent) => this.handleDown(event);
  private readonly onPointerMove = (event: PointerEvent) => this.handleMove(event);
  private readonly onPointerUp = (event: PointerEvent) => this.handleUp(event);
  private readonly onPointerCancel = (event: PointerEvent) => this.handleUp(event);
  private readonly onLostCapture = (event: PointerEvent) => this.handleUp(event);

  getMoveTarget(): { x: number; y: number } | null {
    return this.target;
  }

  override onInit(): void {
    const canvas = this.requireContext().canvas;
    if (!canvas) return;
    this.canvas = canvas;

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", this.onPointerDown, { capture: true });
    canvas.addEventListener("pointermove", this.onPointerMove, { capture: true });
    canvas.addEventListener("pointerup", this.onPointerUp, { capture: true });
    canvas.addEventListener("pointercancel", this.onPointerCancel, {
      capture: true,
    });
    canvas.addEventListener("lostpointercapture", this.onLostCapture, {
      capture: true,
    });
    if (typeof window !== "undefined") {
      window.addEventListener("blur", this.onWindowBlur);
    }
  }

  override onDestroy(): void {
    const canvas = this.canvas;
    if (canvas) {
      canvas.removeEventListener("pointerdown", this.onPointerDown, {
        capture: true,
      });
      canvas.removeEventListener("pointermove", this.onPointerMove, {
        capture: true,
      });
      canvas.removeEventListener("pointerup", this.onPointerUp, { capture: true });
      canvas.removeEventListener("pointercancel", this.onPointerCancel, {
        capture: true,
      });
      canvas.removeEventListener("lostpointercapture", this.onLostCapture, {
        capture: true,
      });
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("blur", this.onWindowBlur);
    }
    this.clearPointer();
    this.canvas = null;
  }

  private allowsGameplaySteer(): boolean {
    const context = this.context;
    if (!context) return false;
    if (context.time.paused) return false;
    if (DialogUI.isOpen()) return false;
    return true;
  }

  private handleDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!this.allowsGameplaySteer()) {
      this.clearPointer();
      return;
    }

    this.activePointerId = event.pointerId;
    try {
      this.canvas?.setPointerCapture(event.pointerId);
    } catch {
      // setPointerCapture may fail on detached canvases in tests
    }
    this.target = this.eventToGame(event);
  }

  private handleMove(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) return;
    if (!this.allowsGameplaySteer()) {
      this.clearPointer();
      return;
    }
    this.target = this.eventToGame(event);
  }

  private handleUp(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) return;
    this.clearPointer();
  }

  private clearPointer(): void {
    this.activePointerId = null;
    this.target = null;
  }

  private eventToGame(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvas;
    if (!canvas) return { x: 0, y: 0 };
    return clientToGameCoords(
      event.clientX,
      event.clientY,
      canvas,
      DISPLAY_WIDTH,
      DISPLAY_HEIGHT,
    );
  }
}
