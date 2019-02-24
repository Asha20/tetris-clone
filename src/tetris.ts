import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  x: number;
  y: number;
}

interface TetrisOptions {
  render: (tetris: Tetris) => void;
  controls: (c: { left: () => void; right: () => void }) => void;
  gravityDelay: number;
}

function fallingTetromino(): FallingTetromino {
  const index = Math.floor(Math.random() * tetrominoes.length);
  return {
    tetromino: tetrominoes[index],
    x: 5,
    y: 0,
  };
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
      this.applyGravity();
    }, opts.gravityDelay);

    opts.controls({
      left: () => this.moveTetromino(-1, 0),
      right: () => this.moveTetromino(1, 0),
    });

    // Quick debug
    window.addEventListener("click", e => {
      if (!e.shiftKey) {
        return;
      }

      // tslint:disable-next-line no-console
      console.log(this.grid);
    });
  }

  /** Attempt to place the falling tetromino into the grid. */
  tryMove(deltaX: number, deltaY: number, shouldMerge: boolean) {
    const shape = this.fallingTetromino.tetromino.currentState;

    const pos: M.Vector = {
      x: this.fallingTetromino.x + deltaX,
      y: this.fallingTetromino.y + deltaY,
    };

    const { matrix, merged } = M.merge(
      this.grid,
      shape,
      pos,
      (x1, x2) => x1 !== 0 && x2 !== 0,
      (x1, x2) => x2,
    );

    if (merged && shouldMerge) {
      this.grid = matrix;
    }

    return merged;
  }

  moveTetromino(deltaX: number, deltaY: number) {
    const canMove = this.tryMove(deltaX, deltaY, false);
    if (canMove) {
      this.fallingTetromino.x += deltaX;
      this.fallingTetromino.y += deltaY;
    }
    return canMove;
  }

  applyGravity() {
    const moved = this.moveTetromino(0, 1);
    if (!moved) {
      this.tryMove(0, 0, true);
      this.fallingTetromino = fallingTetromino();
    }
  }
}
