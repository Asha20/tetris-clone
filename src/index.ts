import Tetris from "./tetris.js";
import tetrisCanvas from "./tetris-canvas.js";

const game = new Tetris({
  controls: () => {
    /* */
  },
  render: tetrisCanvas(document.body, 40),
});
