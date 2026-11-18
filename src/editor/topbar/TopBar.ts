import { clockText } from "../clock";
import {
  CONSOLE_TOOLS,
  type ConsoleDisk,
  type ConsoleTool,
  type ConsoleViewState,
} from "../consoleTypes";
import { isToolFunctional } from "../viewState";
import type { Screen } from "../ui/Screen";
import { cloneTemplate, requireRef, templateRefs } from "../ui/template";
import html from "./topbar.html?raw";

export class TopBar implements Screen<ConsoleViewState> {
  readonly root: HTMLElement;
  readonly tools: HTMLElement;
  readonly toolTabs: HTMLButtonElement[];
  private readonly crumb: HTMLElement;
  private readonly clock: HTMLElement;
  private readonly saveButton: HTMLButtonElement;
  private readonly runButton: HTMLButtonElement;
  private clockTimer = 0;

  private readonly disks: readonly ConsoleDisk[];
  private readonly onTool: (tool: ConsoleTool) => void;
  private readonly onSave: () => void;
  private readonly onRun: () => void;

  constructor(
    disks: readonly ConsoleDisk[],
    onTool: (tool: ConsoleTool) => void,
    onSave: () => void,
    onRun: () => void,
  ) {
    this.disks = disks;
    this.onTool = onTool;
    this.onSave = onSave;
    this.onRun = onRun;
    this.root = cloneTemplate(html);
    const refs = templateRefs(this.root);
    this.crumb = requireRef(refs, "crumb");
    this.clock = requireRef(refs, "clock");
    this.saveButton = requireRef(refs, "save") as HTMLButtonElement;
    this.runButton = requireRef(refs, "run") as HTMLButtonElement;
    this.saveButton.addEventListener("click", () => this.onSave());
    this.runButton.addEventListener("click", () => this.onRun());

    this.tools = document.createElement("div");
    this.tools.className = "beast2d-tool-row";
    this.toolTabs = CONSOLE_TOOLS.map((tool) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "beast2d-tool-tab";
      tab.dataset.tool = tool;
      tab.disabled = !isToolFunctional(tool);
      const glyph = document.createElement("canvas");
      glyph.className = "beast2d-floppy-canvas";
      glyph.dataset.floppy = "tool";
      glyph.dataset.tool = tool;
      tab.appendChild(glyph);
      tab.addEventListener("click", () => {
        if (!isToolFunctional(tool)) return;
        this.onTool(tool);
      });
      this.tools.appendChild(tab);
      return tab;
    });
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root, this.tools);
    this.clock.textContent = clockText();
    this.clockTimer = window.setInterval(() => {
      this.clock.textContent = clockText();
    }, 1000);
  }

  setSaveEnabled(enabled: boolean): void {
    this.saveButton.disabled = !enabled;
  }

  render(state: ConsoleViewState): void {
    const disk = this.disks[state.selectedDiskIndex] ?? this.disks[0];
    const title = disk?.title ?? "";
    this.root.hidden = state.screen === "boot";
    this.tools.hidden = state.screen !== "editor";
    if (state.screen === "home" || state.screen === "boot") {
      this.crumb.textContent = "BEAST2D OS";
      this.saveButton.hidden = true;
      this.runButton.hidden = true;
    } else if (state.screen === "play") {
      this.crumb.textContent = `BEAST2D OS > ${title}`;
      this.saveButton.hidden = true;
      this.runButton.hidden = true;
    } else {
      this.crumb.textContent = `BEAST2D OS > ${title}`;
      const showActions =
        state.activeTool === "CODE" || state.activeTool === "SFX";
      this.saveButton.hidden = !showActions;
      this.runButton.hidden = !showActions;
    }
    for (const tab of this.toolTabs) {
      const tool = tab.dataset.tool as ConsoleTool;
      const active = state.activeTool === tool;
      tab.classList.toggle("beast2d-tool-tab-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    }
  }

  destroy(): void {
    window.clearInterval(this.clockTimer);
    this.root.remove();
    this.tools.remove();
  }
}
