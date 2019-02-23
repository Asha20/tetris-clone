import * as M from "./matrix.js";
import GameCanvas from "./GameCanvas.js";

(window as any).M = M;

const testCanvas = new GameCanvas();
testCanvas.appendTo(document.body);
let y = 0;
testCanvas.render(({ ctx }) => {
  ctx.fillRect(0, y, 20, 20);
  y++;
});
