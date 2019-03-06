import Tetris from "./tetris";
import tetrisCanvas from "./tetris-canvas";

const game = new Tetris({
  gravityDelay: 200,
  render: tetrisCanvas(document.body, 40),
});
