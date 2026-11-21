import { Assets, Application, type Texture } from 'pixi.js';
import { Camera3D, View3D } from '@pixi/3d';
import { PRESET_ICONS, type PresetTextures } from './PresetPad';
import { createSoundSequence } from './audio/model';
import { SoundPlayer } from './audio/SoundPlayer';
import { SoundBoardScene3D } from './three/SoundBoardScene3D';
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
  // WebGL is the default: it redraws the selection ring reliably. '?renderer=webgpu' opts in to WebGPU.
  preference: new URLSearchParams(window.location.search).get('renderer') === 'webgpu' ? 'webgpu' : 'webgl',
  width: DISPLAY_WIDTH,
  height: DISPLAY_HEIGHT,
  backgroundColor: 0x24172f,
  antialias: true,
  autoDensity: false,
  resolution: 1,
});

const camera = new Camera3D({ fov: 32, near: 200, far: 1500 });
camera.position.set(0, 58, 645);
camera.lookAt({ x: 0, y: 0, z: 0 });

const view3d = new View3D({
  autoResize: true,
  camera,
  environment: { skyColor: 0xc9d6ff, groundColor: 0x3a2f45, intensity: 0.7 },
  shadowQuality: 'high',
  toneMapping: 'none',
});
// The view stays hit-testable across the whole canvas so dial drags keep
// tracking wherever the pointer goes (see bindPointer in SoundBoardScene3D).
view3d.eventMode = 'static';
// The composition root owns the data and player, not either rendering component.
const sequence = createSoundSequence(defaultNotes());
const player = new SoundPlayer();
let looping = false;
const scene = new SoundBoardScene3D(app.renderer, presetTextures, mascotTexture, tabIconTextures, sequence, {
  play: () => {
    void player.play(sequence).catch(error => {
      console.error('Sound playback failed:', error);
      window.alert('Sound could not start. Tap Play to try again.');
    });
  },
  stop: () => player.stop(),
  toggleLoop: () => {
    looping = !looping;
    player.setLoopEnabled(looping);
    return looping;
  },
  setMasterVolume: (value) => player.setMasterVolume(value),
  audition: (index) => {
    void player.audition(sequence, index).catch(error => {
      // A blocked browser gesture should not interrupt drawing or open repeated alerts.
      console.warn('Note preview could not start:', error);
    });
  },
});
scene.once('destroyed', () => { void player.dispose(); });
window.addEventListener('pagehide', () => player.stop());
scene.bindPointer(view3d);
view3d.root.addChild(scene);
app.stage.addChild(view3d);
mount.appendChild(app.canvas);

// Readiness marker for automated checks: set after the first rendered frame.
app.ticker.addOnce(() => {
  (window as unknown as { __soundReady: boolean }).__soundReady = true;
});
