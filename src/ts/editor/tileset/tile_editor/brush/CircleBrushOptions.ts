import BrushOptions from './BrushOptions';
import PaletteColor from '../PaletteColor';

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
