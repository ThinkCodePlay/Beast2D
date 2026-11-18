import type { Screen } from "../ui/Screen";
import { cloneTemplate, requireRef, templateRefs } from "../ui/template";
import html from "./boot.html?raw";

/** What the shell asks the boot screen to draw. */
export type BootState = {
  hidden: boolean;
  loading: boolean;
};

/**
 * Reference screen. Markup is boot.html. This class only fills refs and
 * draws BootState. It does not read the DOM back, and it does not touch
 * other screens. Copy this shape for the next screen.
 */
export class BootScreen implements Screen<BootState> {
  readonly root: HTMLElement;

  constructor(diskCount: number) {
    this.root = cloneTemplate(html);
    requireRef(templateRefs(this.root), "disks").textContent =
      `Loading disks... ${diskCount} found`;
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  render(state: BootState): void {
    this.root.hidden = state.hidden;
    this.root.classList.toggle("is-loading", state.loading);
  }

  destroy(): void {
    this.root.remove();
  }
}
