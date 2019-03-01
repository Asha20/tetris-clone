import * as M from "./matrix.js";

type NumMatrix<W extends number, H extends number> = M.Matrix<0 | object, W, H>;

export interface Tetromino<
  W extends number = number,
  H extends number = number
> {
  rotations: [
    NumMatrix<W, H>,
    NumMatrix<H, W>,
    NumMatrix<W, H>,
    NumMatrix<H, W>
  ];
  wallKicks: WallKicks;
  currentState: NumMatrix<W, H> | NumMatrix<H, W>;
  value: object;
  name: string;
}

interface Tuple<T extends any, L extends number> extends Array<T> {
  "0": T;
  length: L;
}

interface WallKickTests {
  clockwise: Tuple<M.Vector, 5>;
  counterClockwise: Tuple<M.Vector, 5>;
}

type WallKicks = Tuple<WallKickTests, 4> | null;

// These wall kicks are used by the tetrominoes
// J, L, S, T and Z.
const threeWideKicks: WallKicks = [
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
];

const fourWideKicks: WallKicks = [
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
  },
  {
    clockwise: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
    counterClockwise: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
  },
];

function tetromino<W extends number, H extends number>(
  name: string,
  wallKicks: WallKicks,
  shape: number[][],
): Tetromino<W, H> {
  const value = { name };
  const matrix1 = M.map(M.fromArray<number, W, H>(shape), x => x && value);
  const matrix2 = M.rotateClockwise(matrix1);
  const matrix3 = M.rotateClockwise(matrix2);
  const matrix4 = M.rotateClockwise(matrix3);

  return {
    name,
    rotations: [matrix1, matrix2, matrix3, matrix4],
    currentState: matrix1,
    wallKicks,
    value,
  };
}

// prettier-ignore
const tetrominoes = [
  // I
  tetromino("I", fourWideKicks, [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),

  // O
  tetromino("O", null, [
    [1, 1],
    [1, 1],
  ]),

  // T
  tetromino("T", threeWideKicks, [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ]),

  // S
  tetromino("S", threeWideKicks, [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ]),

  // Z
  tetromino("Z", threeWideKicks, [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ]),

  // J
  tetromino("J", threeWideKicks, [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ]),

  // L
  tetromino("L", threeWideKicks, [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ]),
];

export default tetrominoes;
