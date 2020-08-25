import SectionElement from './SectionElement';
import Palette from '../../../../util/Palette';

export default class PaletteSelection extends SectionElement {
  private readonly colors: HTMLElement[] = [];
  private readonly palette: Palette;

  constructor(palette: Palette) {
    super('tile-editor-palette-selection');
    this.palette = palette;
    this.element = document.createElement('div');
    this.element.classList.add('ui-palette');
    for (let index = 0; index < palette.colors.length; index++) {
      const colorElement = document.createElement('div');
      colorElement.classList.add('ui-palette-color');
      this.colors.push(colorElement);
      this.element.appendChild(colorElement);
    }
    this.fromPalette();
  }

  private fromPalette(): void {
    for (let index = 0; index < this.palette.colors.length; index++) {
      this.colors[index].style.background = this.palette.colors[index].color;
    }
  }
}
