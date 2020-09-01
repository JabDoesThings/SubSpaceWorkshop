import BrushOptions from './BrushOptions';

export default interface PencilBrushOptions extends BrushOptions {
  square: boolean;
  smoothPressure: boolean;
  smoothAverageCount: number;
}
