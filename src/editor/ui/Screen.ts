export interface Screen<S = void> {
  readonly root: HTMLElement;
  mount(parent: HTMLElement): void;
  render(state: S): void;
  destroy(): void;
}
