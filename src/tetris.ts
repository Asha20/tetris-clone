import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  pos: M.Vector;
}

function log(...args: any[]) {
  // tslint:disable-next-line no-console
  console.log(...args);
}

type Controls = Record<
  | "left"
  | "right"
  | "rotateClockwise"
  | "rotateCounterClockwise"
  | "hardDrop"
  | "pause",
  () => void
>;

interface TetrisOptions {
  render: (tetris: Tetris) => void;
  controls: (c: Controls) => void;
  tetrominoGen: IterableIterator<Tetromino<number, number>>;
  gravityDelay: number;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Overwrite<T, K> = Omit<T, keyof K> & K;

type DefaultOptions = Pick<TetrisOptions, "tetrominoGen">;
const defaultOptions: DefaultOptions = {
  tetrominoGen: randomTetromino(),
};

type UserOptions = Overwrite<TetrisOptions, Partial<DefaultOptions>>;

const colorMap: Record<string, number> = {
  cyan: 1,
  purple: 2,
  green: 3,
  red: 4,
  yellow: 5,
  blue: 6,
  orange: 7,
};

function* randomTetromino() {
  while (true) {
    const index = Math.floor(Math.random() * tetrominoes.length);
    yield tetrominoes[index];
  }
}

function rotateTetromino<W extends number, H extends number>(
  tetromino: Tetromino<W, H>,
  direction: 1 | -1,
): Tetromino<W, H> {
  const { currentState, rotations } = tetromino;
  const currentIndex = rotations.indexOf(currentState);
  const nextIndex =
    (currentIndex + rotations.length + direction) % rotations.length;

  return Object.assign({}, tetromino, { currentState: rotations[nextIndex] });
}

export default class Tetris {
  grid: NumMatrix<10, 20> = M.create(10, 20, () => 0);
  tetrominoGen: IterableIterator<Tetromino<number, number>>;
  fallingTetromino: FallingTetromino;
  private gameOver: boolean = false;
  private paused: boolean = false;
  private gravityIntervalId: number = 0;
  private gravityDelay: number;

  constructor(userOptions: UserOptions) {
    const opts = Object.assign(
      {},
      defaultOptions,
      userOptions,
    ) as TetrisOptions;
    opts.render(this);
    this.tetrominoGen = opts.tetrominoGen;
    this.fallingTetromino = this.nextFallingTetromino();
    this.applyGravity();

    this.gravityDelay = opts.gravityDelay;
    this.gravityIntervalId = setInterval(() => {
      this.applyGravity();
    }, opts.gravityDelay);

    opts.controls({
      left: () => this.moveTetromino(-1, 0),
      right: () => this.moveTetromino(1, 0),
      rotateClockwise: () => this.rotate(1),
      rotateCounterClockwise: () => this.rotate(-1),
      hardDrop: () => this.hardDrop(),
      pause: () => this.pause(),
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

  nextFallingTetromino(): FallingTetromino {
    const tetromino = this.tetrominoGen.next().value;
    const x = Math.floor(
      this.grid.width / 2 - tetromino.currentState.width / 2,
    );
    // SRS says that the I piece spawns one row above the
    // playfield, while the others spawn 2 rows above.
    const y = tetromino.name === "I" ? -1 : -2;
    return { tetromino, pos: { x, y } };
  }

  /** Attempt to place the falling tetromino into the grid. */
  tryMerge(
    tetromino: Tetromino<number, number>,
    pos: M.Vector,
  ): [boolean, NumMatrix<10, 20>] {
    const coloredShape = M.map(tetromino.currentState, value =>
      value > 0 ? colorMap[this.fallingTetromino.tetromino.color] : 0,
    );

    const { matrix, merged } = M.merge(
      this.grid,
      coloredShape,
      1,
      pos,
      (x1, x2, { y }) => x1 !== 0 && x2 !== 0 && y >= 0,
      (x1, x2) => x2 || x1,
    );

    return [merged, matrix];
  }

  moveTetromino(deltaX: number, deltaY: number) {
    if (this.gameOver || this.paused) {
      return;
    }

    const fallingPos = this.fallingTetromino.pos;

    const [canMove] = this.tryMerge(this.fallingTetromino.tetromino, {
      x: fallingPos.x + deltaX,
      y: fallingPos.y + deltaY,
    });
    if (canMove) {
      this.fallingTetromino.pos.x += deltaX;
      this.fallingTetromino.pos.y += deltaY;
    }
    return canMove;
  }

  applyGravity() {
    if (this.gameOver || this.paused) {
      return;
    }

    const moved = this.moveTetromino(0, 1);
    if (!moved) {
      if (this.fallingTetromino.pos.y <= 0) {
        this.gameOver = true;
        log("Game over!");
      }

      const [_, newGrid] = this.tryMerge(
        this.fallingTetromino.tetromino,
        this.fallingTetromino.pos,
      );
      this.grid = newGrid;
      this.fallingTetromino = this.nextFallingTetromino();
      this.applyGravity();
    }
  }

  rotate(direction: 1 | -1) {
    if (this.gameOver || this.paused) {
      return;
    }

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
      const [canRotate] = this.tryMerge(rotated, actualPos);
      if (canRotate) {
        this.fallingTetromino.tetromino = rotated;
        this.fallingTetromino.pos.x += test.x;
        this.fallingTetromino.pos.y += test.y;
        return;
      }
    }
  }

  hardDrop() {
    if (this.gameOver || this.paused) {
      return;
    }

    const { tetromino } = this.fallingTetromino;
    const { x: fallX } = this.fallingTetromino.pos;

    let fallY = this.fallingTetromino.pos.y + 1;
    while (this.tryMerge(tetromino, { x: fallX, y: fallY })[0]) {
      fallY += 1;
    }

    const [_, newGrid] = this.tryMerge(tetromino, {
      x: fallX,
      y: fallY - 1,
    });
    this.grid = newGrid;
    this.fallingTetromino = this.nextFallingTetromino();
    this.applyGravity();
  }

  pause() {
    if (this.gameOver) {
      this.paused = false;
      return;
    }

    this.paused = !this.paused;
    log("Pause:", this.paused);

    if (this.paused) {
      clearInterval(this.gravityIntervalId);
    } else {
      this.gravityIntervalId = setInterval(() => {
        this.applyGravity();
      }, this.gravityDelay);
    }
  }
}
