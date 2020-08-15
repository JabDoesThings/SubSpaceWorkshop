abstract class Brush {

  protected canvas: HTMLCanvasElement;

  protected constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  abstract onRender(): void;
}

export default Brush;
