import Tetris, { FallingTetromino } from "./tetris.js";
import GameCanvas from "./GameCanvas.js";
import { Tetromino } from "./tetrominoes.js";
import { forEach, Vector, Matrix } from "./matrix.js";

type Context = CanvasRenderingContext2D;

function drawGridLines(
  ctx: Context,
  width: number,
  height: number,
  tileSize: number,
) {
  for (let x = 1; x < width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * tileSize, 0);
    ctx.lineTo(x * tileSize, height * tileSize);
    ctx.stroke();
  }

  for (let y = 1; y < height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * tileSize);
    ctx.lineTo(width * tileSize, y * tileSize);
    ctx.stroke();
  }
}

const colorMap: Record<number, string> = {
  1: "cyan",
  2: "purple",
  3: "green",
  4: "red",
  5: "yellow",
  6: "blue",
  7: "orange",
};

function drawGrid(
  ctx: Context,
  grid: Matrix<number, 10, 20>,
  tileSize: number,
) {
  forEach(grid, (value, { x, y }) => {
    if (value === 0) {
      return;
    }

    ctx.fillStyle = colorMap[value];
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  });
}

function drawFallingTetromino(
  ctx: Context,
  fallingTetromino: FallingTetromino,
  tileSize: number,
) {
  const pos = fallingTetromino.pos;
  drawTetromino(ctx, fallingTetromino.tetromino, pos, tileSize);
}

function drawTetromino(
  ctx: Context,
  tetromino: Tetromino<number, number>,
  pos: Vector,
  tileSize: number,
) {
  ctx.fillStyle = tetromino.color;
  forEach(tetromino.currentState, (value, { x, y }) => {
    if (value === 0) {
      return;
    }

    const actualX = pos.x + x;
    const actualY = pos.y + y;

    ctx.fillRect(actualX * tileSize, actualY * tileSize, tileSize, tileSize);
  });
}

function translate(
  ctx: Context,
  x: number,
  y: number,
  fn: (ctx: Context) => void,
) {
  ctx.translate(x, y);
  fn(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawPlayfield(
  ctx: Context,
  pos: Vector,
  grid: Matrix<number, 10, 20>,
  fallingTetromino: FallingTetromino,
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * grid.width, tileSize * 20);
    drawFallingTetromino(ctx, fallingTetromino, tileSize);
    drawGrid(ctx, grid, tileSize);
    drawGridLines(ctx, grid.width, grid.height, tileSize);
  });
}

function drawLeftSidebar(
  ctx: Context,
  pos: Vector,
  holding: Tetromino<number, number> | null,
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * 6, tileSize * 20);

    if (holding) {
      drawTetromino(ctx, holding, { x: 1, y: 1 }, tileSize);
    }
  });
}

function drawRightSidebar(
  ctx: Context,
  pos: Vector,
  preview: Array<Tetromino<number, number>>,
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * 6, tileSize * 20);

    preview.forEach((tetromino, i) => {
      drawTetromino(ctx, tetromino, { x: 1, y: i * 4 + 1 }, tileSize);
    });
  });
}

export default function tetrisCanvas(parent: HTMLElement, tileSize: number) {
  function tile(x: number) {
    return x * tileSize;
  }

  return function _tetrisCanvas(tetris: Tetris) {
    const canvasWidth = tile(tetris.grid.width + 12);
    const canvasHeight = tile(tetris.grid.height);
    const gridWidth = tile(tetris.grid.width);
    const gameCanvas = new GameCanvas(canvasWidth, canvasHeight);
    const gridX = tile(6);
    const rightSidebarX = gridX + gridWidth;

    const playfieldPos: Vector = { x: gridX, y: 0 };
    const leftSidebarPos: Vector = { x: 0, y: 0 };
    const rightSidebarPos: Vector = { x: rightSidebarX, y: 0 };

    gameCanvas.appendTo(parent);
    gameCanvas.render(({ ctx }) => {
      const { grid, fallingTetromino, preview, holding } = tetris;

      drawLeftSidebar(ctx, leftSidebarPos, holding, tileSize);
      drawPlayfield(ctx, playfieldPos, grid, fallingTetromino, tileSize);
      drawRightSidebar(ctx, rightSidebarPos, preview, tileSize);
    });
  };
}
