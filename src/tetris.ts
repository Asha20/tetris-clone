import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

interface FallingPiece {
  piece: Tetromino<number, number>;
  x: number;
  y: number;
}

type Actions = any;

export interface RenderOptions {
  grid: NumMatrix<10, 20>;
  fallingPiece: FallingPiece;
}

type Renderer = (options: RenderOptions) => void;

interface TetrisOptions {
  render: Renderer;
  controls: (actions: Actions) => void;
}

export default class Tetris {
  private grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  private fallingPiece: FallingPiece = {
    piece: tetrominoes[0],
    x: this.grid.width / 2,
    y: 0,
  };

  constructor(opts: TetrisOptions) {
    opts.render({
      grid: this.grid,
      fallingPiece: this.fallingPiece,
    });
  }
}
