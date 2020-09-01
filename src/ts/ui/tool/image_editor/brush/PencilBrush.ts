import Brush from './Brush';
import Palette from '../../../util/Palette';
import PaletteColor from '../../../util/PaletteColor';
import PencilBrushOptions from './PencilBrushOptions';
import { clearCanvas } from '../../../../util/DrawUtils';

const arcLength = Math.PI * 2;

export default class PencilBrush extends Brush {

  options: PencilBrushOptions = {
    square: true,
    size: 8,
    opacity: 1,
    smoothPressure: true,
    smoothAverageCount: 32
  };

  /** @override */
  renderMouse(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | "primary" | "secondary"): void {
    const color = PencilBrush.getColor(palette, colorType);
    this.render(canvas, color, this.options.size);
  }

  /** @override */
  renderPen(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | "primary" | "secondary", pressure: number): void {
    const color = PencilBrush.getColor(palette, colorType);
    this.render(canvas, color, this.options.size * pressure);
  }

  private render(canvas: HTMLCanvasElement, color: PaletteColor, size: number): void {
    size = Math.round(size);
    clearCanvas(canvas, 'transparent', {w: size, h: size});
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color.color;
    ctx.globalAlpha = this.options.opacity;
    if (this.options.square) {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const r = Math.floor(size / 2);
      ctx.beginPath();
      ctx.arc(r - 0.5, r - 0.5, r, 0, arcLength);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
