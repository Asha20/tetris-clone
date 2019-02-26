import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  pos: M.Vector;
}

type Controls = Record<
  "left" | "right" | "rotateClockwise" | "rotateCounterClockwise" | "hardDrop",
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
    wallKicks: tetromino.wallKicks,
    currentState: rotations[nextIndex],
  };
}

export default class Tetris {
  grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  fallingTetromino: FallingTetromino = {
    tetromino: tetrominoes[0],
    pos: { x: this.grid.width / 2, y: 5 },
  };

  constructor(opts: TetrisOptions) {
    opts.render(this);

    setInterval(() => {
      this.applyGravity();
    }, opts.gravityDelay);

    opts.controls({
      left: () => this.moveTetromino(-1, 0),
      right: () => this.moveTetromino(1, 0),
      rotateClockwise: () => this.rotate(1),
      rotateCounterClockwise: () => this.rotate(-1),
      hardDrop: () => this.hardDrop(),
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
      1,
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
    const { tetromino, pos } = this.fallingTetromino;
    const { rotations, currentState } = tetromino;
    const rotated = rotateTetromino(tetromino, direction);

    const currentIndex = rotations.indexOf(currentState);
    const directionInWords = direction === 1 ? "clockwise" : "counterClockwise";
    const tests: M.Vector[] = tetromino.wallKicks
      ? tetromino.wallKicks[currentIndex][directionInWords]
      : [{ x: 0, y: 0 }];

    for (const test of tests) {
      const actualPos = {
        x: pos.x + test.x,
        y: pos.y + test.y,
      };
      const canRotate = this.tryMerge(rotated, actualPos, false);
      if (canRotate) {
        this.fallingTetromino.tetromino = rotated;
        this.fallingTetromino.pos.x += test.x;
        this.fallingTetromino.pos.y += test.y;
        return;
      }
    }
  }

  hardDrop() {
    const { tetromino } = this.fallingTetromino;
    const { x: fallX } = this.fallingTetromino.pos;

    let fallY = this.fallingTetromino.pos.y + 1;
    while (this.tryMerge(tetromino, { x: fallX, y: fallY }, false)) {
      fallY += 1;
    }

    this.tryMerge(tetromino, { x: fallX, y: fallY - 1 }, true);
    this.fallingTetromino = fallingTetromino();
  }
}
