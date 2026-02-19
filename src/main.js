import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0a0005',
  // iOS Safari suspends the WebAudio context until a user gesture, and the
  // async resume() call can block the game loop on some iOS/Safari versions.
  // We have no audio, so disable it entirely to avoid this freeze.
  audio: {
    noAudio: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 640,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
};

new Phaser.Game(config);
