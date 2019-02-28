import * as M from "./matrix.js";
import tetrominoes, { Tetromino } from "./tetrominoes.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

export interface FallingTetromino {
  tetromino: Tetromino<number, number>;
  pos: M.Vector;
}

// tslint:disable-next-line no-empty
function noop() {}

// tslint:disable-next-line no-console
const log = console.log.bind(console);

type Controls = Record<
  | "left"
  | "right"
  | "rotateClockwise"
  | "rotateCounterClockwise"
  | "hardDrop"
  | "pause"
  | "hold",
  () => void
> & { softDrop: (state: boolean) => void };

function defaultControls({
  left,
  right,
  rotateClockwise,
  rotateCounterClockwise,
  hardDrop,
  pause,
  softDrop,
  hold,
}: Controls) {
  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Shift":
      case "c":
        return hold();
      case "ArrowDown":
        return softDrop(true);
      case "ArrowLeft":
        return left();
      case "ArrowRight":
        return right();
      case "ArrowUp":
      case "x":
        return rotateClockwise();
      case "Control":
      case "z":
        return rotateCounterClockwise();
      case " ":
        return hardDrop();
      case "Escape":
      case "F1":
        e.preventDefault();
        return pause();
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      softDrop(false);
    }
  }

  if (window === undefined) {
    log(
      "Unable to apply default Tetris keyboard bindings in a non-browser environment. Please provide a callback in the constructor and set up the controls manually.",
    );
    return noop;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}

interface TetrisOptions {
  render: (tetris: Tetris) => void;
  controls: (c: Controls) => () => void;
  tetrominoGen: IterableIterator<Tetromino<number, number>>;
  gravityDelay: number;
  previewAmount: number;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Overwrite<T, K> = Omit<T, keyof K> & K;

type DefaultOptions = Pick<
  TetrisOptions,
  "tetrominoGen" | "controls" | "previewAmount"
>;
const defaultOptions: DefaultOptions = {
  tetrominoGen: randomTetromino(),
  controls: defaultControls,
  previewAmount: 3,
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
  preview: Array<Tetromino<number, number>>;
  holding: Tetromino<number, number> | null = null;
  private canHold: boolean = true;
  private gameOver: boolean = false;
  private paused: boolean = false;
  private softDropping: boolean = false;
  private originalGravityDelay: number;
  private _gravityIntervalId: number = 0;
  private _gravityDelay: number = 0;
  private unloadControls: () => void;

  get gravity() {
    return this._gravityDelay;
  }

  set gravity(x: number) {
    clearInterval(this._gravityIntervalId);

    if (x > 0) {
      this._gravityIntervalId = setInterval(() => this.applyGravity(), x);
      this._gravityDelay = x;
    }
  }

  constructor(userOptions: UserOptions) {
    const opts = Object.assign(
      {},
      defaultOptions,
      userOptions,
    ) as TetrisOptions;
    opts.render(this);
    this.tetrominoGen = opts.tetrominoGen;
    this.preview = Array.from({ length: opts.previewAmount }, () => {
      return opts.tetrominoGen.next().value;
    });
    this.fallingTetromino = this.nextFallingTetromino();
    this.applyGravity();

    this.gravity = opts.gravityDelay;
    this.originalGravityDelay = opts.gravityDelay;

    this.unloadControls = this.setupControls(opts.controls);
  }

  setupControls(fn: (c: Controls) => () => void) {
    return fn({
      left: () => this.moveTetromino(-1, 0),
      right: () => this.moveTetromino(1, 0),
      rotateClockwise: () => this.rotate(1),
      rotateCounterClockwise: () => this.rotate(-1),
      hardDrop: () => this.hardDrop(),
      pause: () => this.pause(),
      softDrop: (state: boolean) => this.toggleSoftDrop(state),
      hold: () => this.hold(),
    });
  }

  nextFallingTetromino(piece?: Tetromino<number, number>): FallingTetromino {
    const tetromino = piece || this.preview.shift()!;
    const x = Math.floor(
      this.grid.width / 2 - tetromino.currentState.width / 2,
    );
    // SRS says that the I piece spawns one row above the
    // playfield, while the others spawn 2 rows above.
    const y = tetromino.name === "I" ? -1 : -2;

    if (!piece) {
      this.preview.push(this.tetrominoGen.next().value);
    }
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
        this.unloadControls();
        log("Game over!");
      }

      const [_, newGrid] = this.tryMerge(
        this.fallingTetromino.tetromino,
        this.fallingTetromino.pos,
      );
      this.grid = newGrid;
      this.fallingTetromino = this.nextFallingTetromino();
      this.canHold = true;
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

  hold() {
    if (!this.canHold) {
      return;
    }

    const heldPiece = this.holding || undefined;
    this.holding = this.fallingTetromino.tetromino;
    this.fallingTetromino = this.nextFallingTetromino(heldPiece);
    this.holding.currentState = this.holding.rotations[0];

    this.canHold = false;
  }

  toggleSoftDrop(state: boolean) {
    if (this.softDropping === state) {
      return;
    }
    this.softDropping = state;

    if (state) {
      this.applyGravity();
    }

    this.gravity = state
      ? this.originalGravityDelay / 2
      : this.originalGravityDelay;
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
    this.canHold = true;
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

    this.gravity = this.paused ? 0 : this._gravityDelay;
  }
}
