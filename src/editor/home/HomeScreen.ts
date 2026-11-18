import type { ConsoleDisk, ConsoleViewState } from "../consoleTypes";
import type { Screen } from "../ui/Screen";
import { cloneTemplate, requireRef, templateRefs } from "../ui/template";
import html from "./home.html?raw";

export class HomeScreen implements Screen<ConsoleViewState> {
  readonly root: HTMLElement;
  readonly buttons: HTMLButtonElement[] = [];

  constructor(
    disks: readonly ConsoleDisk[],
    onSelect: (index: number, disk: ConsoleDisk) => void,
  ) {
    this.root = cloneTemplate(html);
    const shelf = requireRef(templateRefs(this.root), "shelf");
    disks.forEach((disk, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "beast2d-home-disk";
      btn.dataset.diskIndex = String(index);
      const face = document.createElement("canvas");
      face.className = "beast2d-floppy-canvas";
      face.dataset.floppy = "home";
      face.dataset.disk = disk.id;
      const title = document.createElement("span");
      title.className = "beast2d-home-disk-title";
      title.textContent = disk.title;
      btn.append(face, title);
      btn.addEventListener("click", () => onSelect(index, disk));
      shelf.appendChild(btn);
      this.buttons.push(btn);
    });

    const fresh = document.createElement("button");
    fresh.type = "button";
    fresh.className = "beast2d-home-disk beast2d-home-disk-new";
    fresh.title = "Coming soon";
    const emptySlot = document.createElement("canvas");
    emptySlot.className = "beast2d-floppy-canvas";
    emptySlot.dataset.floppy = "empty";
    const newTitle = document.createElement("span");
    newTitle.className = "beast2d-home-disk-title";
    newTitle.textContent = "+ New disk";
    fresh.append(emptySlot, newTitle);
    shelf.appendChild(fresh);
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  render(state: ConsoleViewState): void {
    this.root.hidden = state.screen !== "home";
    this.buttons.forEach((btn, i) => {
      btn.classList.toggle(
        "beast2d-home-disk-selected",
        i === state.selectedDiskIndex,
      );
    });
  }

  destroy(): void {
    this.root.remove();
  }
}
