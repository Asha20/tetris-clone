import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  x: number;
  y: number;
}

type Actions = any;

interface TetrisOptions {
  render: (tetris: Tetris) => void;
  controls: (actions: Actions) => void;
}

export default class Tetris {
  grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  fallingTetromino: FallingTetromino = {
    tetromino: tetrominoes[0],
    x: this.grid.width / 2,
    y: 0,
  };

  constructor(opts: TetrisOptions) {
    opts.render(this);

    setInterval(() => {
      this.fallingTetromino.y =
        (this.fallingTetromino.y + 1) % this.grid.height;
    }, 500);

    window.addEventListener("click", () => {
      this.fallingTetromino = { tetromino: tetrominoes[1], x: 0, y: 0 };
    });
  }
}
