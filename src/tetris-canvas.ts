import Tetris, { FallingTetromino, Grid } from "./tetris.js";
import GameCanvas from "./GameCanvas.js";
import { Tetromino } from "./tetrominoes.js";
import { forEach, Vector } from "./matrix.js";
import tetrominoes from "./tetrominoes.js";

type Context = CanvasRenderingContext2D;
type ColorMap = Map<object, string>;

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

function drawGrid(
  ctx: Context,
  colorMap: ColorMap,
  grid: Grid,
  tileSize: number,
) {
  forEach(grid, (value, { x, y }) => {
    if (value === 0) {
      return;
    }

    ctx.fillStyle = colorMap.get(value)!;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  });
}

function drawFallingTetromino(
  ctx: Context,
  colorMap: ColorMap,
  fallingTetromino: FallingTetromino,
  tileSize: number,
) {
  const pos = fallingTetromino.pos;
  drawTetromino(ctx, colorMap, fallingTetromino.tetromino, pos, tileSize);
}

function drawTetromino(
  ctx: Context,
  colorMap: ColorMap,
  tetromino: Tetromino,
  pos: Vector,
  tileSize: number,
) {
  ctx.fillStyle = colorMap.get(tetromino.value)!;
  forEach(tetromino.currentState, (value, { x, y }) => {
    if (value === 0) {
      return;
    }

    const actualX = pos.x + x;
    const actualY = pos.y + y;

    ctx.fillRect(actualX * tileSize, actualY * tileSize, tileSize, tileSize);
  });
}

function nameMapToColorMap(nameMap: Record<string, string>): ColorMap {
  return new Map(
    Object.keys(nameMap).reduce<Array<[object, string]>>((acc, name) => {
      const tetromino = tetrominoes.find(x => x.name === name);
      const color = nameMap[name];
      if (tetromino) {
        acc.push([tetromino.value, color]);
      }
      return acc;
    }, []),
  );
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
  colorMap: ColorMap,
  pos: Vector,
  grid: Grid,
  fallingTetromino: FallingTetromino,
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * grid.width, tileSize * 20);
    drawFallingTetromino(ctx, colorMap, fallingTetromino, tileSize);
    drawGrid(ctx, colorMap, grid, tileSize);
    drawGridLines(ctx, grid.width, grid.height, tileSize);
  });
}

function drawLeftSidebar(
  ctx: Context,
  colorMap: ColorMap,
  pos: Vector,
  holding: Tetromino | undefined,
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * 6, tileSize * 20);

    if (holding) {
      drawTetromino(ctx, colorMap, holding, { x: 1, y: 1 }, tileSize);
    }
  });
}

function drawRightSidebar(
  ctx: Context,
  colorMap: ColorMap,
  pos: Vector,
  preview: Tetromino[],
  tileSize: number,
) {
  translate(ctx, pos.x, pos.y, () => {
    ctx.strokeRect(0, 0, tileSize * 6, tileSize * 20);

    preview.forEach((tetromino, i) => {
      drawTetromino(ctx, colorMap, tetromino, { x: 1, y: i * 4 + 1 }, tileSize);
    });
  });
}

const defaultColors: Record<string, string> = {
  I: "cyan",
  O: "yellow",
  T: "purple",
  S: "green",
  Z: "red",
  J: "blue",
  L: "orange",
};

export default function tetrisCanvas(
  parent: HTMLElement,
  tileSize: number,
  nameToColor?: Record<string, string>,
) {
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

    const colorMap = nameMapToColorMap(nameToColor || defaultColors);

    gameCanvas.appendTo(parent);
    gameCanvas.render(({ ctx }) => {
      const { grid, fallingTetromino, preview, holding } = tetris;

      drawLeftSidebar(ctx, colorMap, leftSidebarPos, holding, tileSize);
      drawPlayfield(
        ctx,
        colorMap,
        playfieldPos,
        grid,
        fallingTetromino,
        tileSize,
      );
      drawRightSidebar(ctx, colorMap, rightSidebarPos, preview, tileSize);
    });
  };
}
