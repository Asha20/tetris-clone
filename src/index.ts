import Tetris from "./tetris.js";
import tetrisCanvas from "./tetris-canvas.js";

const game = new Tetris({
  gravityDelay: 200,
  controls: ({ left, right, rotateClockwise, hardDrop, pause }) => {
    window.addEventListener("keydown", e => {
      switch (e.key) {
        case "ArrowLeft":
          return left();
        case "ArrowRight":
          return right();
        case "ArrowUp":
          return rotateClockwise();
        case " ":
          return hardDrop();
        case "Escape":
        case "F1":
          e.preventDefault();
          return pause();
      }
    });
  },
  render: tetrisCanvas(document.body, 40),
});
