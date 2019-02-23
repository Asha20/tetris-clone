import * as M from "./matrix.js";

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  pos: M.Vector;
  tileSize: number;
}

type NumMatrix<W extends number, H extends number> = M.Matrix<number, W, H>;

interface Tetromino<W extends number, H extends number> {
  rotations: [
    NumMatrix<W, H>,
    NumMatrix<H, W>,
    NumMatrix<W, H>,
    NumMatrix<H, W>
  ];
  currentState: NumMatrix<W, H> | NumMatrix<H, W>;
  render: (options: RenderOptions) => void;
}

function tetromino<W extends number, H extends number>(
  color: string,
  shape: number[][],
): Tetromino<W, H> {
  const matrix1 = M.fromArray<number, W, H>(shape);
  const matrix2 = M.rotateClockwise(matrix1);
  const matrix3 = M.rotateClockwise(matrix2);
  const matrix4 = M.rotateClockwise(matrix3);

  return {
    rotations: [matrix1, matrix2, matrix3, matrix4],
    currentState: matrix1,
    render: ({ ctx, pos, tileSize }) => {
      const oldStyle = ctx.fillStyle;
      ctx.fillStyle = color;
      ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
      ctx.fillStyle = oldStyle;
    },
  };
}

// prettier-ignore
const tetrominoes = [
  // I
  tetromino("cyan", [
    [1, 1, 1, 1]
  ]),

  // O
  tetromino("yellow", [
    [1, 1],
    [1, 1],
  ]),

  // T
  tetromino("purple", [
    [0, 1, 0],
    [1, 1, 1],
  ]),

  // S
  tetromino("green", [
    [0, 1, 1],
    [1, 1, 0],
  ]),

  tetromino("red", [
    [1, 1, 0],
    [0, 1, 1],
  ]),

  // J
  tetromino("blue", [
    [1, 0, 0],
    [1, 1, 1],
  ]),

  // L
  tetromino("orange", [
    [0, 0, 1],
    [1, 1, 1],
  ]),
];

export default tetrominoes;
