import CustomEvent from '../CustomEvent';
import Palette from './Palette';
import PaletteAction from './PaletteAction';
import PaletteColor from './PaletteColor';

export default interface PaletteEvent extends CustomEvent {
  forced: boolean;
  eventType: string;
  palette: Palette;
  action: PaletteAction;
  color: PaletteColor | null;
}
