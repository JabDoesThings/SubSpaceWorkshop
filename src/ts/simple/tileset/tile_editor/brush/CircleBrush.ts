import Brush from './Brush';
import { Path } from '../../../../util/Path';

class CircleBrush extends Brush {

  onRender(canvas: HTMLCanvasElement): void {
    this._draw(canvas, this.size);
  }

  private _draw(canvas: HTMLCanvasElement, size: number): void {
    const width = size;
    const height = size;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.hardness;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  onPressure(canvas: HTMLCanvasElement, pressure: number): void {
    const size = Math.floor(Path.lerp(this.penSizeMin, this.penSizeMax, pressure));
    this._draw(canvas, size);
  }
}

export default CircleBrush;
