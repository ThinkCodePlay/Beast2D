import { Container, Graphics, Text } from 'pixi.js';
import type { SoundBank } from '../bank';

export const LCD_HEIGHT = 32;

/**
 * The sound-name LCD on the transport row: an inset plate whose text follows
 * the sound bank's selected slot. Subscribes to the bank, so it stays current
 * in whichever renderer hosts it (2D panel or 3D overlay texture).
 */
export class SoundNameLcd extends Container {
  private readonly nameText: Text;

  constructor(width: number, bank: SoundBank) {
    super();
    this.addChild(new Graphics()
      .roundRect(0, 0, width, LCD_HEIGHT, 4).fill(0x24152e)
      .roundRect(2, 2, width - 4, LCD_HEIGHT - 4, 3).fill(0x7d4f99)
      .roundRect(3, 3, width - 6, LCD_HEIGHT - 6, 3).fill(0x371c51)
      .roundRect(4, 4, width - 8, 9, 2).fill({ color: 0x4a2c66, alpha: 0.6 }));
    this.nameText = new Text({
      text: bank.selectedName,
      style: { fontFamily: 'monogram', fontSize: 16, fontWeight: 'bold', fill: 0xffeaff, stroke: { color: 0x2a1440, width: 1 } }, resolution: 3,
    });
    this.nameText.position.set(8, 6);
    this.addChild(this.nameText);
    bank.onChange(() => this.setName(bank.selectedName));
  }

  /** Show a sound name. */
  setName(name: string): void {
    this.nameText.text = name;
  }
}
