import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  pos: M.Vector;
}

type Controls = Record<
  "left" | "right" | "rotateClockwise" | "rotateCounterClockwise",
  () => void
>;

interface TetrisOptions {
  render: (tetris: Tetris) => void;
  controls: (c: Controls) => void;
  gravityDelay: number;
}

function fallingTetromino(): FallingTetromino {
  const index = Math.floor(Math.random() * tetrominoes.length);
  return {
    tetromino: tetrominoes[index],
    pos: { x: 5, y: 0 },
  };
}

const colorMap: Record<string, number> = {
  cyan: 1,
  purple: 2,
  green: 3,
  red: 4,
  yellow: 5,
  blue: 6,
  orange: 7,
};

function rotateTetromino<W extends number, H extends number>(
  tetromino: Tetromino<W, H>,
  direction: 1 | -1,
): Tetromino<W, H> {
  const { currentState, rotations } = tetromino;
  const currentIndex = rotations.indexOf(currentState);
  const nextIndex =
    (currentIndex + rotations.length + direction) % rotations.length;

  return {
    color: tetromino.color,
    rotations: tetromino.rotations,
    currentState: rotations[nextIndex],
  };
}

export default class Tetris {
  grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  fallingTetromino: FallingTetromino = {
    tetromino: tetrominoes[1],
    pos: { x: this.grid.width / 2, y: 5 },
  };

  constructor(opts: TetrisOptions) {
    opts.render(this);

    // setInterval(() => {
    //   this.applyGravity();
    // }, opts.gravityDelay);

    opts.controls({
      left: () => this.moveTetromino(-1, 0),
      right: () => this.moveTetromino(1, 0),
      rotateClockwise: () => this.rotate(1),
      rotateCounterClockwise: () => this.rotate(-1),
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
  tryMerge(
    tetromino: Tetromino<number, number>,
    pos: M.Vector,
    updateGrid: boolean,
  ) {
    const coloredShape = M.map(tetromino.currentState, value =>
      value > 0 ? colorMap[this.fallingTetromino.tetromino.color] : 0,
    );

    const { matrix, merged } = M.merge(
      this.grid,
      coloredShape,
      pos,
      (x1, x2) => x1 !== 0 && x2 !== 0,
      (x1, x2) => x2 || x1,
    );

    if (merged && updateGrid) {
      this.grid = matrix;
    }

    return merged;
  }

  moveTetromino(deltaX: number, deltaY: number) {
    const fallingPos = this.fallingTetromino.pos;
    const currentWidth = this.fallingTetromino.tetromino.currentState.width;
    const currentHeight = this.fallingTetromino.tetromino.currentState.height;

    // Do a simple out-of-bounds check first before attempting
    // the more expensive merge with the grid.
    if (
      fallingPos.x + deltaX < 0 ||
      fallingPos.x + currentWidth + deltaX > this.grid.width ||
      fallingPos.y + deltaY < 0 ||
      fallingPos.y + currentHeight + deltaY > this.grid.height
    ) {
      return false;
    }

    const canMove = this.tryMerge(
      this.fallingTetromino.tetromino,
      {
        x: fallingPos.x + deltaX,
        y: fallingPos.y + deltaY,
      },
      false,
    );
    if (canMove) {
      this.fallingTetromino.pos.x += deltaX;
      this.fallingTetromino.pos.y += deltaY;
    }
    return canMove;
  }

  applyGravity() {
    const moved = this.moveTetromino(0, 1);
    if (!moved) {
      this.tryMerge(
        this.fallingTetromino.tetromino,
        this.fallingTetromino.pos,
        true,
      );
      this.fallingTetromino = fallingTetromino();
    }
  }

  rotate(direction: 1 | -1) {
    const rotated = rotateTetromino(this.fallingTetromino.tetromino, direction);
    const { pos } = this.fallingTetromino;

    const canRotate = this.tryMerge(rotated, pos, false);
    if (canRotate) {
      this.fallingTetromino.tetromino = rotated;
    }
  }
}
