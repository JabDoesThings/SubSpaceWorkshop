import Palette from '../../../util/Palette';
import BrushOptions from './BrushOptions';

export default abstract class Brush {
  options: BrushOptions = {
    size: 8,
    opacity: 0.5,
  };

  // Pen pressure fields.
  penSizeMin: number = null;
  penSizeMax: number = null;
  penOpacityMin: number = 0;
  penOpacityMax: number = 1;
  opacityPressure: boolean = true;
  sizePressure: boolean = true;
  colorPressure: boolean = true;

  /**
   * TODO: Document.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Palette} palette
   * @param {'primary'|'secondary'} colorType
   */
  abstract renderMouse(canvas: HTMLCanvasElement, palette: Palette, colorType: 'primary' | 'secondary'): void;

  /**
   * TODO: Document.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Palette} palette
   * @param {'primary'|'secondary'} colorType
   * @param {number} pressure
   */
  abstract renderPen(canvas: HTMLCanvasElement, palette: Palette, colorType: 'primary' | 'secondary', pressure: number): void;
}
