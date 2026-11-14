import { SFX_SLOTS } from "../../core/sfx/chips";
import { el } from "./buildDom";

export type SfxBankUi = {
  bank: HTMLElement;
  rows: HTMLElement[];
  rowNames: HTMLElement[];
  rowBadges: HTMLElement[];
  onChoose: (index: number) => void;
  onPlayRow: (index: number) => void;
};

export function buildSfxBank(onChoose: (index: number) => void, onPlayRow: (index: number) => void): SfxBankUi {
  const bank = el("section", "beast2d-sfx-bank");
  bank.setAttribute("aria-label", "Sound bank");
  const bankHead = el("div", "beast2d-sfx-bank-head");
  bankHead.append(el("span", "beast2d-sfx-bank-title", "SOUND BANK"), el("span", "beast2d-sfx-bank-run", "RUN → GAME"));
  const list = el("div", "beast2d-sfx-list");
  const rows: HTMLElement[] = [];
  const rowNames: HTMLElement[] = [];
  const rowBadges: HTMLElement[] = [];
  for (let index = 0; index < SFX_SLOTS; index += 1) {
    const row = el("div", "beast2d-sfx-row");
    const main = el("button", "beast2d-sfx-row-main") as HTMLButtonElement;
    main.type = "button";
    const slot = el("span", "beast2d-sfx-slot", String(index).padStart(2, "0"));
    const name = el("span", "beast2d-sfx-row-name", "empty");
    const badge = el("span", "beast2d-sfx-row-badge", "GB");
    const play = el("button", "beast2d-sfx-row-play") as HTMLButtonElement;
    play.type = "button";
    play.title = "Play";
    play.append(el("span", "beast2d-sfx-row-play-icon"));
    play.addEventListener("click", (event) => {
      event.stopPropagation();
      onPlayRow(index);
    });
    main.append(slot, name, badge, play);
    main.addEventListener("click", () => onChoose(index));
    row.append(main);
    list.append(row);
    rows.push(row);
    rowNames.push(name);
    rowBadges.push(badge);
  }
  bank.append(bankHead, list);
  return { bank, rows, rowNames, rowBadges, onChoose, onPlayRow };
}