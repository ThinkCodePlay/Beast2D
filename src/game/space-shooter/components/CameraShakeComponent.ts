import { Component } from "../../../core/components/Component";

export type CameraShakeOptions = {
  /** Max offset in pixels (whole numbers). */
  intensity?: number;
  /** Respect prefers-reduced-motion when true (default). */
  respectReducedMotion?: boolean;
  enabled?: boolean;
};

/** Applies random integer offsets to the host GameObject container (attach to playfield root). */
export class CameraShakeComponent extends Component {
  private intensity: number;
  private respectReducedMotion: boolean;
  private shakeEnabled: boolean;
  private remainingFrames = 0;
  private baseX = 0;
  private baseY = 0;
  private offsetReady = false;

  constructor(options: CameraShakeOptions = {}) {
    super();
    this.intensity = options.intensity ?? 2;
    this.respectReducedMotion = options.respectReducedMotion ?? true;
    this.shakeEnabled = options.enabled ?? true;
  }

  setShakeEnabled(value: boolean): void {
    this.shakeEnabled = value;
    if (!value) this.resetOffset();
  }

  /** Trigger shake for durationFrames at optional intensity override. */
  shake(durationFrames: number, intensity?: number): void {
    if (!this.shakeEnabled) return;
    if (this.respectReducedMotion && prefersReducedMotion()) return;
    this.remainingFrames = Math.max(this.remainingFrames, durationFrames);
    if (intensity !== undefined) this.intensity = intensity;
  }

  override update(_dt: number): void {
    if (!this.gameObject) return;
    const t = this.gameObject.container;
    if (!this.offsetReady) {
      this.baseX = t.x;
      this.baseY = t.y;
      this.offsetReady = true;
    }

    if (!this.shakeEnabled || this.remainingFrames <= 0) {
      this.resetOffset();
      return;
    }

    this.remainingFrames -= 1;
    const shakePx = this.intensity;
    t.x = this.baseX + (Math.random() > 0.5 ? shakePx : -shakePx);
    t.y = this.baseY + (Math.random() > 0.5 ? 1 : -1);
    if (this.remainingFrames <= 0) {
      this.resetOffset();
    }
  }

  private resetOffset(): void {
    if (!this.gameObject) return;
    this.gameObject.container.x = this.baseX;
    this.gameObject.container.y = this.baseY;
  }

  override onDestroy(): void {
    this.resetOffset();
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
