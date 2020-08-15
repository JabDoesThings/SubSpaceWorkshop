import Brush from './Brush';
import { Path } from '../../../../util/Path';

class PencilBrush extends Brush {

  penSizeMin: number = 1;
  penSizeMax: number = 8;

  size: number = 3;
  hardness: number = 0.5;
  color: string = 'red';

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  onRender(): void {
    this._draw(this.size);
  }

  private _draw(size: number): void {
    const width = size;
    const height = size;

    this.canvas.width = width;
    this.canvas.height = height;

    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.hardness;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  onPressure(pressure: number): void {
    const size = Math.floor(Path.lerp(this.penSizeMin, this.penSizeMax, pressure));
    this._draw(size);
  }
}

export default PencilBrush;
