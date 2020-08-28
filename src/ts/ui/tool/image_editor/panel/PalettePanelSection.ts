import EditorPanelSection from './EditorPanelSection';
import Palette from '../../../util/Palette';
import PaletteSelection from './element/PaletteSelection';

/**
 * The <i>PalettePanelSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class PalettePanelSection extends EditorPanelSection {
  private palette: Palette;

  constructor(palette: Palette) {
    super('tile-editor-palette-panel', 'Palette');
    this.palette = palette;
    const paletteSelection = new PaletteSelection(palette);
    this.content.contents.appendChild(paletteSelection.element);
  }
}
