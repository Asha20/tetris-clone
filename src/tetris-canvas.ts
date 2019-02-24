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

export default function tetrisCanvas(parent: HTMLElement, tileSize: number) {
  let gameCanvas: GameCanvas;

  return function _tetrisCanvas(tetris: Tetris) {
    if (!gameCanvas) {
      gameCanvas = new GameCanvas(
        tetris.grid.width * tileSize,
        tetris.grid.height * tileSize,
      );
      gameCanvas.appendTo(parent);
    }

    gameCanvas.render(({ ctx }) => {
      const { grid, fallingTetromino } = tetris;
      drawFallingTetromino(ctx, fallingTetromino, tileSize);
      drawGrid(ctx, grid, tileSize);
      drawGridLines(ctx, grid.width, grid.height, tileSize);
    });
  };
}
