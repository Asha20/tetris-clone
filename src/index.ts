import Tetris from "./tetris.js";
import tetrisCanvas from "./tetris-canvas.js";

const game = new Tetris({
  gravityDelay: 100,
  controls: ({ left, right }) => {
    window.addEventListener("keydown", e => {
      switch (e.key) {
        case "ArrowLeft":
          return left();
        case "ArrowRight":
          return right();
      }
    });
  },
  render: tetrisCanvas(document.body, 40),
});
