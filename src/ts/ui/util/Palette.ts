import PaletteColor from './PaletteColor';
import CustomEventListener from '../CustomEventListener';
import PaletteEvent from './PaletteEvent';
import PaletteAction from './PaletteAction';

export default class Palette extends CustomEventListener<PaletteEvent> {
  readonly colors: PaletteColor[] = [];
  primary: PaletteColor;
  secondary: PaletteColor;

  constructor() {
    super();
    for (let index = 0; index < 122; index++) {
      this.colors.push(new PaletteColor(1, 1, 1));
    }
    this.primary = new PaletteColor(1, 0, 0);
    this.secondary = new PaletteColor(0, 0, 0);
  }

  setPrimary(other: PaletteColor) {
    this.primary.set(other.r, other.g, other.b, other.a);
    this.dispatch(<PaletteEvent> {
      forced: true,
      eventType: 'PaletteEvent',
      action: PaletteAction.SET_PRIMARY,
      palette: this,
      color: other});
  }

  setSecondary(other: PaletteColor) {
    this.secondary.set(other.r, other.g, other.b, other.a);
    this.dispatch(<PaletteEvent> {
      forced: true,
      eventType: 'PaletteEvent',
      action: PaletteAction.SET_SECONDARY,
      palette: this,
      color: other});
  }
}
