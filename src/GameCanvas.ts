type Context = CanvasRenderingContext2D;

interface RenderOptions {
  ctx: Context;
}

// tslint:disable-next-line no-empty
function noop() {}

type RenderFn = (opts: RenderOptions) => void;

export default class GameCanvas {
  private canvas: HTMLCanvasElement = document.createElement("canvas");
  private context: Context = this.canvas.getContext("2d")!;
  private parent: HTMLElement | null = null;
  private renderFn: () => void = noop;
  private rafId: number = 0;
  private width: number = 0;
  private height: number = 0;

  constructor(width: number, height: number) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
  }

  appendTo(parent: HTMLElement) {
    if (this.parent) {
      return;
    }
    parent.appendChild(this.canvas);
    this.parent = parent;
  }

  render(fn: RenderFn) {
    if (this.renderFn !== noop) {
      return;
    }
    this.renderFn = () => {
      this.context.clearRect(0, 0, this.width, this.height);
      fn({ ctx: this.context });
      requestAnimationFrame(this.renderFn);
    };
    this.rafId = requestAnimationFrame(this.renderFn);
  }

  stopRendering() {
    if (this.renderFn === noop) {
      return;
    }
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.renderFn = noop;
  }
}
