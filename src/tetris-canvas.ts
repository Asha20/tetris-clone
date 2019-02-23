import { RenderOptions, FallingTetromino } from "./tetris.js";
import GameCanvas from "./GameCanvas.js";
import { Tetromino } from "./tetrominoes.js";
import { forEach } from "./matrix.js";

type Context = CanvasRenderingContext2D;

function drawGrid(
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

function drawFallingTetromino(
  ctx: Context,
  fallingTetromino: FallingTetromino,
  tileSize: number,
) {
  const pos = { x: fallingTetromino.x, y: fallingTetromino.y };
  drawTetromino(ctx, fallingTetromino.tetromino, tileSize);
}

function drawTetromino(
  ctx: Context,
  tetromino: Tetromino<number, number>,
  tileSize: number,
) {
  ctx.fillStyle = tetromino.color;
  forEach(tetromino.currentState, (value, { x, y }) => {
    if (value === 0) {
      return;
    }

    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  });
}

export default function tetrisCanvas(parent: HTMLElement, tileSize: number) {
  return function _tetrisCanvas(opts: RenderOptions) {
    const { grid, fallingTetromino } = opts;
    const gameCanvas = new GameCanvas(
      grid.width * tileSize,
      grid.height * tileSize,
    );
    gameCanvas.appendTo(parent);

    gameCanvas.render(({ ctx }) => {
      drawFallingTetromino(ctx, fallingTetromino, tileSize);
      drawGrid(ctx, grid.width, grid.height, tileSize);
    });
  };
}
