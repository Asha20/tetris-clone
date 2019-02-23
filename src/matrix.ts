type Tuple<T, L extends number> = [...T[]] & { length: L };
type _Matrix<T, W extends number, H extends number> = Tuple<Tuple<T, W>, H>;

export interface Vector {
  x: number;
  y: number;
}

export interface Matrix<T, W extends number, H extends number> {
  matrix: _Matrix<T, W, H>;
  width: W;
  height: H;
}

type MatrixCallback<T, W extends number, H extends number, ReturnValue> = (
  value: T,
  pos: Vector,
  matrix: _Matrix<T, W, H>,
) => ReturnValue;

export function create<T, W extends number, H extends number>(
  width: W,
  height: H,
  callback?: MatrixCallback<any, W, H, T>,
): Matrix<T, W, H> {
  if (width <= 0 || height <= 0) {
    throw new Error("Invalid matrix dimensions.");
  }

  const matrix = Array.from({ length: height }, () =>
    Array.from({ length: width }),
  ) as Tuple<Tuple<T, W>, H>;

  if (typeof callback !== "function") {
    return { matrix, width, height };
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      matrix[y][x] = callback(matrix[y][x], { x, y }, matrix);
    }
  }

  return { matrix, width, height };
}

export function fromArray<T, W extends number, H extends number>(
  array: T[][],
): Matrix<T, W, H> {
  const height = array.length as H;
  const width = (array[0] || []).length as W;

  if (array.some(row => !Array.isArray(row) || row.length !== width)) {
    throw new Error("Array must have rows of equal lengths.");
  }

  return create(width, height, (_, { x, y }) => array[y][x]);
}

export function map<T, U, W extends number, H extends number>(
  m: Matrix<T, W, H>,
  callback: MatrixCallback<T, W, H, U>,
): Matrix<U, W, H> {
  return create(m.width, m.height, (_, { x, y }, arr) =>
    callback(m.matrix[y][x], { x, y }, arr),
  );
}

export function forEach<T, W extends number, H extends number>(
  m: Matrix<T, W, H>,
  callback: MatrixCallback<T, W, H, void>,
): void {
  for (let y = 0; y < m.height; y++) {
    for (let x = 0; x < m.width; x++) {
      callback(m.matrix[y][x], { x, y }, m.matrix);
    }
  }
}

export function clone<T, W extends number, H extends number>(
  m: Matrix<T, W, H>,
): Matrix<T, W, H> {
  return map(m, item => item);
}

export function merge<
  T,
  W1 extends number,
  H1 extends number,
  W2 extends number,
  H2 extends number
>(
  m1: Matrix<T, W1, H1>,
  m2: Matrix<T, W2, H2>,
  pos: Vector,
  isColliding: (x1: T, x2: T, pos: Vector) => boolean,
  merger: (x1: T, x2: T, pos: Vector) => T,
): { matrix: Matrix<T, W1, H1>; merged: boolean } {
  if (pos.x + m2.width > m1.width || pos.y + m2.height > m1.height) {
    console.log("M2 doesn't fit inside M1");
    return { matrix: m1, merged: false };
  }

  const output = clone(m1);
  for (let y2 = 0; y2 < m2.height; y2++) {
    for (let x2 = 0; x2 < m2.width; x2++) {
      const x1 = pos.x + x2;
      const y1 = pos.y + y2;
      const item1 = m1.matrix[y1][x1];
      const item2 = m2.matrix[y2][x2];
      const currentPos = { x: x1, y: y1 };
      if (isColliding(item1, item2, currentPos)) {
        console.log(`Collision detected at (${x1}, ${y1})`);
        return { matrix: m1, merged: false };
      }
      output.matrix[y1][x1] = merger(item1, item2, currentPos);
    }
  }

  return { matrix: output, merged: true };
}

export function rotateClockwise<T, W extends number, H extends number>(
  m: Matrix<T, W, H>,
): Matrix<T, H, W> {
  return create<T, H, W>(m.height, m.width, (_, { x, y }) => {
    return m.matrix[m.height - x - 1][y];
  });
}

export function rotateCounterClockwise<T, W extends number, H extends number>(
  m: Matrix<T, W, H>,
): Matrix<T, H, W> {
  return create<T, H, W>(m.height, m.width, (_, { x, y }) => {
    return m.matrix[x][m.width - y - 1];
  });
}
