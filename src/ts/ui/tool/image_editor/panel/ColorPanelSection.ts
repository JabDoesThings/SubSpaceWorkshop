import EditorPanelSection from './EditorPanelSection';
import Palette from '../../../util/Palette';
import PaletteSelection from './element/PaletteSelection';
import ColorSelection from './element/ColorSelection';

/**
 * The <i>ColorPanelSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ColorPanelSection extends EditorPanelSection {
  private palette: Palette;

  constructor(palette: Palette) {
    super('tile-editor-colors', 'Colors');
    this.palette = palette;
    const colorSelection = new ColorSelection(palette);
    this.content.contents.appendChild(colorSelection.element);
  }
}
