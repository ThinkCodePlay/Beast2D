import { Assets, Application, Rectangle, type Texture } from 'pixi.js';
import { PRESET_ICONS, type PresetTextures } from './PresetPad';
import { SoundBoardFrame } from './SoundBoardFrame';
import { createSoundSequence } from './audio/model';
import { SoundPlayer } from './audio/SoundPlayer';
import { defaultNotes } from './ui/StepPitchGrid';

const DISPLAY_WIDTH = 1536;
const DISPLAY_HEIGHT = 1024;
const mount = document.querySelector<HTMLElement>('#app');

if (!mount) {
  throw new Error('Sound tool mount element #app was not found.');
}

await document.fonts.load('12px "monogram"');

const mascotTexture = await Assets.load<Texture>('art/bunny.png');
mascotTexture.source.scaleMode = 'nearest';

const presetTextures = Object.fromEntries(await Promise.all(PRESET_ICONS.map(async (icon) => {
  const texture = await Assets.load<Texture>(`art/presets/${icon}.png`);
  texture.source.scaleMode = 'nearest';
  return [icon, texture];
}))) as PresetTextures;

const tabIconTextures = Object.fromEntries(await Promise.all(['gamepad', 'folder', 'gear'].map(async (icon) => {
  const texture = await Assets.load<Texture>(`art/tabs/${icon}.png`);
  texture.source.scaleMode = 'nearest';
  return [icon, texture];
})));

const app = new Application();
await app.init({
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  backgroundColor: 0x24172f,
  antialias: false,
  autoDensity: false,
  resolution: 1,
});

// The stage stays hit-testable across the whole canvas so knob drags keep
// tracking wherever the pointer goes (see trackDrag in ui/Pressable).
app.stage.eventMode = 'static';
app.stage.hitArea = new Rectangle(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

// The composition root owns the data and player, not either rendering component.
const sequence = createSoundSequence(defaultNotes());
const player = new SoundPlayer();
const board = new SoundBoardFrame(presetTextures, mascotTexture, tabIconTextures, sequence, {
  play: () => {
    void player.play(sequence).catch(error => {
      console.error('Sound playback failed:', error);
      window.alert('Sound could not start. Tap Play to try again.');
    });
  },
  stop: () => player.stop(),
  setMasterVolume: (value) => player.setMasterVolume(value),
  audition: (index) => {
    void player.audition(sequence, index).catch(error => {
      // A blocked browser gesture should not interrupt drawing or open repeated alerts.
      console.warn('Note preview could not start:', error);
    });
  },
});
board.once('destroyed', () => { void player.dispose(); });
window.addEventListener('pagehide', () => player.stop());
app.stage.addChild(board);
mount.appendChild(app.canvas);
