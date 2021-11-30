import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene.js";
import { width, height } from "./modules/config.js";

const config = {
  type: Phaser.AUTO,
  width,
  height,
  backgroundColor: "#000000",
  pixelArt: true,
  scene: [MainScene]
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
