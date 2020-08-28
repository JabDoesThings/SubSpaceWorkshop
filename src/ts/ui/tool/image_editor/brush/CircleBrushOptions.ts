import BrushOptions from './BrushOptions';
import PaletteColor from '../../../util/PaletteColor';

/**
 * The <i>CircleBrushOptions</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface CircleBrushOptions extends BrushOptions {
  size: number;
  hardness: number;
  opacity: number;
  smoothPressure: boolean;
  smoothAverageCount: number;
  outline: boolean;
  outlineColor: PaletteColor;
  outlineThickness: number;
}
