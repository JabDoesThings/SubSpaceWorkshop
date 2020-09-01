import Palette from '../../../util/Palette';
import BrushOptions from './BrushOptions';
import PaletteColor from '../../../util/PaletteColor';

/**
 * The <i>Brush</i> class. TODO: Document.
 *
 * @author Jab
 */
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
  abstract renderMouse(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | 'primary' | 'secondary'): void;

  /**
   * TODO: Document.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Palette} palette
   * @param {'primary'|'secondary'} colorType
   * @param {number} pressure
   */
  abstract renderPen(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | 'primary' | 'secondary', pressure: number): void;

  static getColor(palette: Palette, colorType: PaletteColor | 'primary' | 'secondary'): PaletteColor {
    let color: PaletteColor;
    if (colorType instanceof PaletteColor) {
      color = colorType;
    } else {
      if (colorType === 'primary') {
        color = palette.primary;
      } else {
        color = palette.secondary;
      }
    }
    return color;
  }
}
