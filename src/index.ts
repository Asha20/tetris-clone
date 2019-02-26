import Tetris from "./tetris.js";
import tetrisCanvas from "./tetris-canvas.js";

const game = new Tetris({
  gravityDelay: 200,
  render: tetrisCanvas(document.body, 40),
});
