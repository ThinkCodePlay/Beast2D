/** One cart game: setup once, then update and draw every frame. */
export interface Cart {
  init(): void;
  /** `dt` is seconds. */
  update(dt: number): void;
  draw(): void;
}
