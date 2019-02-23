import { RenderOptions } from "./tetris.js";
import GameCanvas from "./GameCanvas.js";

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

export default function tetrisCanvas(parent: HTMLElement, tileSize: number) {
  return function _tetrisCanvas(opts: RenderOptions) {
    const { grid } = opts;
    const gameCanvas = new GameCanvas(
      grid.width * tileSize,
      grid.height * tileSize,
    );
    gameCanvas.appendTo(parent);

    gameCanvas.render(({ ctx }) => {
      drawGrid(ctx, grid.width, grid.height, tileSize);
    });
  };
}
