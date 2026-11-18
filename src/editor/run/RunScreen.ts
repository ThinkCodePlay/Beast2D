import type { ConsoleViewState } from "../consoleTypes";
import type { Screen } from "../ui/Screen";
import { cloneTemplate, requireRef, templateRefs } from "../ui/template";
import html from "./run.html?raw";

export class RunScreen implements Screen<ConsoleViewState> {
  readonly root: HTMLElement;
  readonly frame: HTMLElement;
  readonly bank: HTMLElement;

  constructor() {
    this.root = cloneTemplate(html);
    const refs = templateRefs(this.root);
    this.bank = requireRef(refs, "bank");
    this.frame = requireRef(refs, "frame");
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  /** SFX bank node is built by the SFX editor and parked here while editing. */
  attachBank(node: HTMLElement): void {
    this.bank.append(node);
  }

  attachGame(game: HTMLElement): void {
    this.frame.appendChild(game);
  }

  render(state: ConsoleViewState): void {
    const showSfx = state.screen === "editor" && state.activeTool === "SFX";
    const sfxPreviewGame = showSfx && state.editorMode === "run";
    this.bank.hidden = !showSfx || sfxPreviewGame;
    this.frame.hidden = showSfx && !sfxPreviewGame;
    this.root.classList.toggle(
      "beast2d-preview-column-bank",
      showSfx && !sfxPreviewGame,
    );
  }

  destroy(): void {
    this.root.remove();
  }
}
