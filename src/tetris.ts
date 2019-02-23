import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  x: number;
  y: number;
}

type Actions = any;

export interface RenderOptions {
  grid: NumMatrix<10, 20>;
  fallingTetromino: FallingTetromino;
}

type Renderer = (options: RenderOptions) => void;

interface TetrisOptions {
  render: Renderer;
  controls: (actions: Actions) => void;
}

export default class Tetris {
  private grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  private fallingTetromino: FallingTetromino = {
    tetromino: tetrominoes[0],
    x: this.grid.width / 2,
    y: 0,
  };

  constructor(opts: TetrisOptions) {
    opts.render({
      grid: this.grid,
      fallingTetromino: this.fallingTetromino,
    });
  }
}
