import PaletteColor from './PaletteColor';

class Palette {
  readonly colors: PaletteColor[];
  primary: PaletteColor;
  secondary: PaletteColor;

  constructor() {
    this.colors = [];
    for (let index = 0; index < 256; index++) {
      this.colors.push(new PaletteColor(1, 1, 1));
    }
    this.primary = new PaletteColor(1, 0, 0);
    this.secondary = new PaletteColor(0, 0, 0);
  }
}

export default Palette;
