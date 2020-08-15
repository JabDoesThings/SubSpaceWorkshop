abstract class Brush {

  penSizeMin: number = 1;
  penSizeMax: number = 8;
  size: number = 3;
  hardness: number = 0.5;
  color: string = 'red';

  abstract onPressure(canvas: HTMLCanvasElement, pressure: number): void;

  abstract onRender(canvas: HTMLCanvasElement): void;
}

export default Brush;
