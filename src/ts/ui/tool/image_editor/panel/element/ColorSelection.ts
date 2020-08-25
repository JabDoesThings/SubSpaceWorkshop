import SectionElement from './SectionElement';
import Palette from '../../../../util/Palette';

export default class ColorSelection extends SectionElement {
  private readonly primaryElement: HTMLElement;
  private readonly secondaryElement: HTMLElement;
  private readonly palette: Palette;

  constructor(palette: Palette) {
    super('tile-editor-color-selection');
    this.palette = palette;
    this.primaryElement = document.createElement('div');
    this.primaryElement.classList.add('ui-color-picked');
    this.secondaryElement = document.createElement('div');
    this.secondaryElement.classList.add('ui-color-picked');
    this.element = document.createElement('div');
    this.element.classList.add('ui-color');
    this.element.appendChild(this.primaryElement);
    this.element.appendChild(this.secondaryElement);
    this.fromPalette();
  }

  private fromPalette(): void {
    this.primaryElement.style.background = this.palette.primary.color;
    this.secondaryElement.style.background = this.palette.secondary.color;
  }
}
