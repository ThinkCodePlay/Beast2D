import { Container } from 'pixi.js';
import { WAVEFORM_TYPES, type WaveformType } from '../audio/model';
import { WaveformButton } from './WaveformButton';

/** Row of the six waveform buttons. Exactly one is selected, marked by its ring. */
export class WaveformSelector extends Container {
  private readonly buttons: WaveformButton[];

  constructor(selected: WaveformType, columnStep: number, private readonly onSelect: (type: WaveformType) => void) {
    super();
    this.buttons = WAVEFORM_TYPES.map((type, index) => {
      const button = new WaveformButton(type, type === selected);
      button.position.x = index * columnStep;
      button.on('pointertap', () => this.select(type));
      return button;
    });
    this.addChild(...this.buttons);
  }

  private select(type: WaveformType): void {
    this.setSelected(type);
    this.onSelect(type);
  }

  /** Move the ring without firing onSelect (e.g. after a bank slot switch). */
  setSelected(type: WaveformType): void {
    this.buttons.forEach(button => button.setSelected(button.type === type));
  }
}
